"use client";

import { InputField, SelectField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import { AUTO_PEN, HOLDING_PEN_SPARE } from "@/constants/pen";
import { MIN_SALE_AGE_MONTHS } from "@/constants/piglet";
import { useForm, useFormSubmit } from "@/hooks";
import {
  saleFormSchema,
  type SaleFormValues,
  type SalePayload,
} from "@/schemas/saleSchema";
import type { Pen } from "@/types/pen";
import type { PigletBatch } from "@/types/piglet";
import type { Buyer, Sale } from "@/types/sale";
import { formatCurrency, toInputDate, toLocalDateString } from "@/utils/format";
import { penOccupied } from "@/utils/pen";
import { isSellable } from "@/utils/piglet";

import { Modal } from "./modal";

interface SaleFormModalProps {
  sale: Sale | null; // null = thêm mới
  batches: PigletBatch[];
  buyers: Buyer[];
  pens: Pen[];
  onSubmit: (payload: SalePayload) => Promise<void>;
  onClose: () => void;
}

const num = (v: string) => String(Number(v));

function toFormValues(sale: Sale | null): SaleFormValues {
  if (!sale) {
    return {
      sale_date: toLocalDateString(),
      shipping_date: "",
      batch_id: "",
      pen_id: AUTO_PEN,
      buyer_id: "",
      quantity: "",
      total_weight_kg: "",
      price_per_kg: "",
    };
  }
  return {
    sale_date: toInputDate(sale.sale_date),
    shipping_date: sale.shipping_date ? toInputDate(sale.shipping_date) : "",
    batch_id: String(sale.batch_id),
    pen_id: "",
    buyer_id: sale.buyer_id != null ? String(sale.buyer_id) : "",
    quantity: String(sale.quantity),
    total_weight_kg: num(sale.total_weight_kg),
    price_per_kg: num(sale.price_per_kg),
  };
}

// Chuồng chờ bán phải khác chuồng hiện tại của đàn và còn đủ chỗ cho số con bán.
// Bán một phần thì đàn được tách: chỉ số con bán chuyển đi, phần còn lại ở lại chuồng cũ.
function penFits(pen: Pen, batch: PigletBatch | undefined, quantity: number) {
  if (!batch || pen.id === batch.pen_id) return false;
  return pen.capacity - penOccupied(pen) >= quantity;
}

// Chuồng đang chọn có còn hợp lệ không ("" = không chuyển, luôn hợp lệ)
function selectedPenFits(
  pens: Pen[],
  batches: PigletBatch[],
  penId: string,
  batchId: string,
  quantity: number,
) {
  if (penId === AUTO_PEN || penId === "") return true;
  const batch = batches.find((b) => String(b.id) === batchId);
  const pen = pens.find((p) => String(p.id) === penId);
  return pen ? penFits(pen, batch, quantity) : false;
}

// Parent render modal này có `key` theo từng bản ghi nên state luôn khởi tạo mới mỗi lần mở
export function SaleFormModal({
  sale,
  batches,
  buyers,
  pens,
  onSubmit,
  onClose,
}: SaleFormModalProps) {
  const { formData, handleChange } = useForm<SaleFormValues>(
    toFormValues(sale),
    {
      // Đổi đàn hoặc số lượng mà chuồng đang chọn hết đủ chỗ -> quay về tự tạo chuồng chờ bán mới
      customHandlers: {
        // Đổi ngày bán mà đàn đang chọn không còn đủ điều kiện bán vào ngày đó -> bỏ chọn đàn
        sale_date: (value, prev) => {
          const batch = batches.find((b) => String(b.id) === prev.batch_id);
          return !sale && batch && !isSellable(batch, String(value))
            ? { batch_id: "", pen_id: AUTO_PEN }
            : {};
        },
        batch_id: (value, prev) =>
          selectedPenFits(
            pens,
            batches,
            prev.pen_id,
            String(value),
            Number(prev.quantity) || 0,
          )
            ? {}
            : { pen_id: AUTO_PEN },
        quantity: (value, prev) =>
          selectedPenFits(
            pens,
            batches,
            prev.pen_id,
            prev.batch_id,
            Number(value) || 0,
          )
            ? {}
            : { pen_id: AUTO_PEN },
      },
    },
  );
  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: saleFormSchema,
    values: formData,
    onSubmit,
  });

  // Chỉ bán đàn đã cai sữa trở đi hoặc đủ 1 tháng tuổi vào ngày bán đang chọn
  const sellableBatches = batches.filter((b) =>
    isSellable(b, formData.sale_date),
  );
  const batchOptions = sellableBatches.map((b) => ({
    label: `${b.code} (${b.quantity != null ? `${b.quantity} con` : "chưa ghi số lượng"})`,
    value: String(b.id),
  }));
  const buyerOptions = [
    { label: "— Không chọn —", value: "" },
    ...buyers.map((b) => ({
      label: b.phone ? `${b.name} (${b.phone})` : b.name,
      value: String(b.id),
    })),
  ];

  const selectedBatch = batches.find((b) => String(b.id) === formData.batch_id);
  const quantity = Number(formData.quantity) || 0;
  const maxQuantity = selectedBatch?.quantity ?? undefined;

  // Chuồng chờ bán: số con bán được chuyển vào đó khi tạo phiếu. Chỉ liệt kê chuồng còn đủ chỗ.
  const remaining =
    selectedBatch?.quantity != null ? selectedBatch.quantity - quantity : null;
  const wholeBatch = remaining === 0;
  const otherPens = pens.filter((p) => penFits(p, selectedBatch, quantity));
  const penOptions = [
    { value: AUTO_PEN, label: "Tự động tạo chuồng chờ bán mới" },
    ...otherPens.map((p) => ({
      value: String(p.id),
      label: `Chuyển vào ${p.name} (còn ${p.capacity - penOccupied(p)} chỗ)`,
    })),
  ];
  const newPenCapacity = quantity + HOLDING_PEN_SPARE;
  const currentPenName = pens.find((p) => p.id === selectedBatch?.pen_id)?.name;

  // Server tự tính total_revenue = tổng trọng lượng * đơn giá; đây chỉ là bản xem trước
  const weight = Number(formData.total_weight_kg);
  const price = Number(formData.price_per_kg);
  const estimate = weight > 0 && price > 0 ? weight * price : null;

  return (
    <Modal
      title={sale ? "Cập Nhật Phiếu Bán Heo" : "Tạo Phiếu Bán Heo"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="sale_date"
            name="sale_date"
            type="date"
            max={toLocalDateString()}
            label="Ngày bán *"
            value={formData.sale_date}
            onChange={handleChange}
            error={errors.sale_date}
            size="sm"
          />
          <InputField
            id="shipping_date"
            name="shipping_date"
            type="date"
            min={formData.sale_date || undefined}
            label="Ngày vận chuyển"
            value={formData.shipping_date}
            onChange={handleChange}
            error={errors.shipping_date}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          {sale ? (
            <InputField
              id="batch"
              label="Đàn bán"
              value={sale.pigletBatch.code}
              disabled
              readOnly
              size="sm"
            />
          ) : (
            <SelectField
              id="batch_id"
              name="batch_id"
              label="Đàn bán *"
              placeholder="Chọn đàn"
              options={batchOptions}
              value={formData.batch_id}
              onChange={handleChange}
              error={errors.batch_id}
              size="sm"
            />
          )}

          <SelectField
            id="buyer_id"
            name="buyer_id"
            label="Người mua / thương lái"
            options={buyerOptions}
            value={formData.buyer_id}
            onChange={handleChange}
            error={errors.buyer_id}
            size="sm"
          />
        </div>

        {!sale && (
          <p
            className={`-mt-2 text-xs ${sellableBatches.length === 0 ? "text-warning-fg" : "text-fg-muted"}`}
          >
            {sellableBatches.length === 0
              ? `Chưa có đàn nào đủ điều kiện bán vào ngày này (đã cai sữa hoặc đủ ${MIN_SALE_AGE_MONTHS} tháng tuổi).`
              : `Chỉ bán đàn đã cai sữa hoặc đủ ${MIN_SALE_AGE_MONTHS} tháng tuổi vào ngày bán.`}
          </p>
        )}

        {!sale && (
          <>
            <SelectField
              id="pen_id"
              name="pen_id"
              label="Chuồng chờ bán"
              options={penOptions}
              value={formData.pen_id}
              onChange={handleChange}
              error={errors.pen_id}
              size="sm"
            />
            <p
              className={`-mt-2 text-xs ${
                selectedBatch && quantity > 0 && otherPens.length === 0
                  ? "text-warning-fg"
                  : "text-fg-muted"
              }`}
            >
              {!selectedBatch || quantity <= 0
                ? "Chọn đàn và số lượng bán để xem các chuồng đủ chỗ."
                : (() => {
                    const split = wholeBatch
                      ? "Bán hết đàn: cả đàn chuyển sang chuồng chờ bán."
                      : remaining != null
                        ? `Tách ${quantity} con sang chuồng chờ bán, ${remaining} con còn lại ở lại${currentPenName ? ` ${currentPenName}` : " chuồng hiện tại"}.`
                        : `Đàn chưa ghi số lượng nên cả đàn chuyển sang chuồng chờ bán.`;
                    if (otherPens.length === 0) {
                      return `${split} Không có chuồng nào đủ chỗ cho ${quantity} con, nên tạo chuồng chờ bán mới (sức chứa ${newPenCapacity} con).`;
                    }
                    return formData.pen_id === AUTO_PEN
                      ? `${split} Chuồng mới có sức chứa ${newPenCapacity} con (${quantity} con + ${HOLDING_PEN_SPARE} chỗ dự phòng).`
                      : split;
                  })()}
            </p>
          </>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
          <InputField
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            max={sale ? undefined : maxQuantity}
            step="1"
            label="Số lượng (con) *"
            value={formData.quantity}
            onChange={handleChange}
            error={errors.quantity}
            size="sm"
          />
          <InputField
            id="total_weight_kg"
            name="total_weight_kg"
            type="number"
            min="0"
            step="any"
            label="Tổng trọng lượng (kg) *"
            value={formData.total_weight_kg}
            onChange={handleChange}
            error={errors.total_weight_kg}
            size="sm"
          />
          <InputField
            id="price_per_kg"
            name="price_per_kg"
            type="number"
            min="0"
            step="any"
            label="Giá / kg (VNĐ) *"
            value={formData.price_per_kg}
            onChange={handleChange}
            error={errors.price_per_kg}
            size="sm"
          />
        </div>

        {(selectedBatch || estimate != null) && (
          <div className="bg-surface-muted text-fg-body space-y-1 rounded-lg p-2.5 text-xs">
            {selectedBatch && (
              <p>
                Đàn {selectedBatch.code}:{" "}
                {selectedBatch.quantity != null
                  ? `hiện có ${selectedBatch.quantity} con`
                  : "chưa ghi số lượng"}
              </p>
            )}
            {estimate != null && (
              <p>
                Tổng tiền ước tính:{" "}
                <strong className="text-success">
                  {formatCurrency(estimate, "đ")}
                </strong>
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Đang lưu..." : sale ? "Lưu Thay Đổi" : "Lưu Hóa Đơn"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
