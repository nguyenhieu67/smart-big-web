"use client";

import axios from "axios";

import { InputField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import { SOW_BREED_SUGGESTIONS } from "@/constants/sow";
import { useForm, useFormSubmit } from "@/hooks";
import {
  boarFormSchema,
  type BoarFormValues,
  type BoarPayload,
} from "@/schemas/boarSchema";
import type { Boar } from "@/types/mating";

import { Modal } from "./modal";

interface BoarFormModalProps {
  boar: Boar | null; // null = thêm mới
  onSubmit: (payload: BoarPayload) => Promise<void>;
  onClose: () => void;
}

// Parent render modal này có `key` theo từng bản ghi nên state luôn khởi tạo mới mỗi lần mở
export function BoarFormModal({ boar, onSubmit, onClose }: BoarFormModalProps) {
  const { formData, handleChange } = useForm<BoarFormValues>({
    code: boar?.code ? boar?.code : "TINH-",
    breed: boar?.breed ?? "",
  });
  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: boarFormSchema,
    values: formData,
    onSubmit,
    // BE trả 409 "Duplicate entry." khi trùng (farm_id, code)
    mapError: (err) =>
      axios.isAxiosError(err) && err.response?.status === 409
        ? { code: "Mã đã tồn tại trong trại này" }
        : undefined,
  });

  return (
    <Modal
      title={boar ? "Cập Nhật Heo Đực / Tinh" : "Thêm Heo Đực / Tinh"}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        <InputField
          id="code"
          name="code"
          label="Mã heo đực / tinh *"
          placeholder="Ví dụ: D-01"
          value={formData.code}
          onChange={handleChange}
          error={errors.code}
          size="sm"
        />
        <div>
          <InputField
            id="breed"
            name="breed"
            label="Giống *"
            list="boar-breeds"
            placeholder="Chọn hoặc nhập giống"
            value={formData.breed}
            onChange={handleChange}
            error={errors.breed}
            size="sm"
          />
          <datalist id="boar-breeds">
            {SOW_BREED_SUGGESTIONS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Đang lưu..." : boar ? "Lưu Thay Đổi" : "Lưu"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
