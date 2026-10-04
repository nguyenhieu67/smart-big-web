"use client";

import { InputField, SelectField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import { AUTO_PEN, FARROWING_PEN_SPARE } from "@/constants/pen";
import { useForm, useFormSubmit } from "@/hooks";
import {
  farrowingCreateSchema,
  farrowingUpdateSchema,
  type FarrowingFormValues,
  type FarrowingPayload,
} from "@/schemas/farrowingSchema";
import type { Farrowing } from "@/types/farrowing";
import type { Pen } from "@/types/pen";
import type { Sow } from "@/types/sow";
import { toInputDate, toLocalDateString } from "@/utils/format";
import { penOccupied } from "@/utils/pen";

import { Modal } from "./modal";

interface FarrowingFormModalProps {
  farrowing: Farrowing | null; // null = thêm mới
  sows: Sow[];
  pens: Pen[];
  onSubmit: (payload: FarrowingPayload) => Promise<void>;
  onClose: () => void;
}

const num = (v: number | null | undefined) => (v == null ? "0" : String(v));

function toFormValues(farrowing: Farrowing | null): FarrowingFormValues {
  if (!farrowing) {
    return {
      sow_id: "",
      pen_id: AUTO_PEN,
      farrow_date: toLocalDateString(),
      live_born: "",
      dead_born: "0",
      weak_born: "0",
      avg_birth_weight: "",
      assist_note: "",
    };
  }
  return {
    sow_id: String(farrowing.sow_id),
    pen_id: "",
    farrow_date: toInputDate(farrowing.farrow_date),
    live_born: num(farrowing.live_born),
    dead_born: num(farrowing.dead_born),
    weak_born: num(farrowing.weak_born),
    avg_birth_weight:
      farrowing.avg_birth_weight != null
        ? String(Number(farrowing.avg_birth_weight))
        : "",
    assist_note: farrowing.assist_note ?? "",
  };
}

// Chuồng đủ chỗ cho nái mẹ + heo con sống + số heo đang ở đó (nái đã ở chuồng này thì đã nằm trong số đang ở)
function penFits(pen: Pen, sows: Sow[], sowId: string, liveBorn: number) {
  const sowInPen =
    String(sows.find((s) => String(s.id) === sowId)?.pen_id) === String(pen.id);
  const needed = liveBorn + (sowInPen ? 0 : 1);
  return pen.capacity - penOccupied(pen) >= needed;
}

// Chuồng đang chọn có còn đủ chỗ không ("" = giữ chuồng hiện tại của nái)
function selectedPenFits(
  pens: Pen[],
  sows: Sow[],
  penId: string,
  sowId: string,
  liveBorn: number,
) {
  if (penId === AUTO_PEN) return true;
  const id =
    penId === ""
      ? String(sows.find((s) => String(s.id) === sowId)?.pen_id)
      : penId;
  const pen = pens.find((p) => String(p.id) === id);
  return pen ? penFits(pen, sows, sowId, liveBorn) : false;
}

// Parent render modal này có `key` theo từng bản ghi nên state luôn khởi tạo mới mỗi lần mở
export function FarrowingFormModal({
  farrowing,
  sows,
  pens,
  onSubmit,
  onClose,
}: FarrowingFormModalProps) {
  const { formData, handleChange } = useForm<FarrowingFormValues>(
    toFormValues(farrowing),
    {
      // Đổi nái hoặc số con sống mà chuồng đang chọn hết đủ chỗ -> quay về tự tạo chuồng đẻ mới
      customHandlers: {
        sow_id: (value, prev) =>
          selectedPenFits(
            pens,
            sows,
            prev.pen_id,
            String(value),
            Number(prev.live_born) || 0,
          )
            ? {}
            : { pen_id: AUTO_PEN },
        live_born: (value, prev) =>
          selectedPenFits(
            pens,
            sows,
            prev.pen_id,
            prev.sow_id,
            Number(value) || 0,
          )
            ? {}
            : { pen_id: AUTO_PEN },
      },
    },
  );
  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: farrowing ? farrowingUpdateSchema : farrowingCreateSchema,
    values: formData,
    onSubmit,
  });

  // Chỉ nái đang mang thai mới ghi nhận đẻ được
  const sowOptions = sows
    .filter((s) => s.status === "PREGNANT")
    .map((s) => ({ label: `${s.code} - ${s.breed}`, value: String(s.id) }));

  // Chuồng đẻ: nái và đàn heo con cùng ở chuồng này. Chỉ liệt kê chuồng còn đủ chỗ.
  const live = Number(formData.live_born) || 0;
  const dead = Number(formData.dead_born) || 0;
  const currentPenId = String(
    sows.find((s) => String(s.id) === formData.sow_id)?.pen_id,
  );
  const currentPen = pens.find((p) => String(p.id) === currentPenId);
  const keepCurrent =
    currentPen && penFits(currentPen, sows, formData.sow_id, live);
  const otherPens = pens.filter(
    (p) =>
      String(p.id) !== currentPenId && penFits(p, sows, formData.sow_id, live),
  );
  const penOptions = [
    { value: AUTO_PEN, label: "Tự động tạo chuồng đẻ mới" },
    ...(keepCurrent
      ? [
          {
            value: "",
            label: `Giữ nguyên chuồng hiện tại (${currentPen.name})`,
          },
        ]
      : []),
    ...otherPens.map((p) => ({
      value: String(p.id),
      label: `Chuyển vào ${p.name} (còn ${p.capacity - penOccupied(p)} chỗ)`,
    })),
  ];
  const noExistingPen = !keepCurrent && otherPens.length === 0;
  const newPenCapacity = 1 + live + FARROWING_PEN_SPARE;

  // Server tự tính total_born = sống + chết; đây chỉ là bản xem trước
  return (
    <Modal
      title={farrowing ? "Cập Nhật Ca Sinh" : "Ghi Nhận Nái Sinh Sản"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          {farrowing ? (
            <InputField
              id="sow"
              label="Nái mẹ"
              value={farrowing.sow.code}
              disabled
              readOnly
              size="sm"
            />
          ) : (
            <SelectField
              id="sow_id"
              name="sow_id"
              label="Mã nái mẹ *"
              placeholder="Chọn nái"
              options={sowOptions}
              value={formData.sow_id}
              onChange={handleChange}
              error={errors.sow_id}
              size="sm"
            />
          )}
          <InputField
            id="farrow_date"
            name="farrow_date"
            type="date"
            max={toLocalDateString()}
            label="Ngày sinh *"
            value={formData.farrow_date}
            onChange={handleChange}
            error={errors.farrow_date}
            size="sm"
          />
        </div>

        {!farrowing && (
          <SelectField
            id="pen_id"
            name="pen_id"
            label="Chuồng đẻ"
            options={penOptions}
            value={formData.pen_id}
            onChange={handleChange}
            error={errors.pen_id}
            size="sm"
          />
        )}
        {!farrowing && (
          <p
            className={`-mt-2 text-xs ${noExistingPen ? "text-warning-fg" : "text-fg-muted"}`}
          >
            {noExistingPen
              ? `Không có chuồng nào đủ chỗ cho nái mẹ + ${live} heo con. Nên tạo chuồng đẻ mới (sức chứa ${newPenCapacity} con).`
              : formData.pen_id === AUTO_PEN
                ? `Chuồng mới có sức chứa ${newPenCapacity} con (nái mẹ + ${live} heo con + ${FARROWING_PEN_SPARE} chỗ dự phòng).`
                : `Chỉ hiện các chuồng còn đủ chỗ cho nái mẹ + ${live} heo con.`}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
          <InputField
            id="live_born"
            name="live_born"
            type="number"
            min="0"
            max="40"
            step="1"
            label="Số con sống *"
            value={formData.live_born}
            onChange={handleChange}
            error={errors.live_born}
            size="sm"
          />
          <InputField
            id="dead_born"
            name="dead_born"
            type="number"
            min="0"
            max="40"
            step="1"
            label="Số con chết"
            value={formData.dead_born}
            onChange={handleChange}
            error={errors.dead_born}
            size="sm"
          />
          <InputField
            id="weak_born"
            name="weak_born"
            type="number"
            min="0"
            max="40"
            step="1"
            label="Số con yếu"
            value={formData.weak_born}
            onChange={handleChange}
            error={errors.weak_born}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="avg_birth_weight"
            name="avg_birth_weight"
            type="number"
            min="0"
            step="any"
            label="TL sơ sinh TB (kg/con)"
            value={formData.avg_birth_weight}
            onChange={handleChange}
            error={errors.avg_birth_weight}
            size="sm"
          />
          <InputField
            id="assist_note"
            name="assist_note"
            label="Hỗ trợ sinh / khó đẻ"
            placeholder="Ví dụ: Đẻ tự nhiên, tiêm oxytocin"
            value={formData.assist_note}
            onChange={handleChange}
            error={errors.assist_note}
            size="sm"
          />
        </div>

        <div className="bg-surface-muted text-fg-body space-y-1 rounded-lg p-2.5 text-xs">
          <p>
            Tổng sinh: <strong className="text-fg">{live + dead} con</strong>{" "}
            (con yếu nằm trong số con sống)
          </p>
          {!farrowing && (
            <p className="text-fg-muted">
              Khi lưu: nái chuyển sang &quot;Đang nuôi con&quot;, tăng số lứa
              thêm 1, chuyển vào chuồng đẻ đã chọn và tự tạo đàn heo con (cùng
              chuồng với nái) nếu có con sống.
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Đang lưu..."
              : farrowing
                ? "Lưu Thay Đổi"
                : "Lưu Ca Sinh"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
