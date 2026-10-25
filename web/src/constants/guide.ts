import type { MockProps } from "@/components/guide/screenMock";

export interface GuideStep {
  text: string; // số thứ tự của bước khớp với số trong ảnh minh họa
}

export interface GuideSection {
  id: string;
  title: string;
  href?: string; // trang tương ứng trong app
  intro: string;
  steps: GuideStep[];
  tips?: string[];
  figure?: MockProps;
}

// Nội dung trang hướng dẫn, theo thứ tự nên làm khi mới bắt đầu dùng hệ thống
export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "bat-dau",
    title: "Bắt đầu: đăng ký, chọn trại, phân quyền",
    intro:
      "Mỗi tài khoản đăng ký sẽ có sẵn một trại cùng các danh mục cơ bản (loại cám, danh mục chi phí, vaccine thường dùng) để bạn dùng ngay.",
    steps: [
      {
        text: "Đăng ký bằng email và mật khẩu (tối thiểu 6 ký tự), có thể đặt tên trại ngay lúc đăng ký.",
      },
      {
        text: "Chọn trại đang làm việc ở ô chọn trại trên thanh trên cùng. Mọi số liệu trên màn hình thuộc về trại đang chọn.",
      },
      {
        text: "Trên điện thoại, bấm biểu tượng ☰ để mở menu bên trái và chọn chức năng.",
      },
      {
        text: "Biểu tượng chuông ở góc phải trên cùng hiện số thông báo chưa đọc (nái sắp đẻ, đàn cần tiêm vaccine, việc đến hạn, giao hàng). Bấm vào để mở danh sách, bấm một thông báo để tới đúng trang xử lý. Bên cạnh là nút đăng xuất.",
      },
    ],
    tips: [
      "OWNER (chủ trại): làm được tất cả, kể cả xóa dữ liệu danh mục và tiền. MANAGER (quản lý): thêm, sửa mọi thứ; xóa nhật ký. WORKER (nhân viên): xem và ghi nhật ký hằng ngày, không xóa.",
      "Thứ tự nên làm khi mới dùng: Chuồng trại → Heo nái → Heo đực/tinh → Phối giống → Thai kỳ → Sinh sản → Đàn heo con → Thức ăn → Vaccine → Bán heo → Chi phí → Doanh thu.",
    ],
    figure: {
      title: "Thanh trên cùng của SmartPig",
      topbar: { menu: 3, farm: 2, actions: 4 },
    },
  },
  {
    id: "chuong-trai",
    title: "1. Tạo chuồng trại",
    href: "/pens",
    intro:
      "Chuồng là nơi nái và heo con ở. Hãy tạo chuồng trước vì thêm nái, ghi nhận sinh và cho ăn đều cần chọn chuồng.",
    steps: [
      { text: 'Vào menu "9. Quản Lý Chuồng Trại" rồi bấm "Thêm Chuồng".' },
      {
        text: 'Nhập tên chuồng (không trùng), tên phụ / loại chuồng (ví dụ "Chuồng đẻ"), sức chứa tối đa và mô tả nếu cần.',
      },
      {
        text: "Bấm lưu. Thẻ chuồng hiện số heo đang ở và thanh mức đầy so với sức chứa.",
      },
    ],
    tips: [
      'Chuồng chờ bán ("Chuồng chờ bán-01", "-02"...) do hệ thống tự tạo khi bán heo, bạn không cần tạo tay. Thẻ chuồng hiện trạng thái Trống hoặc Đang chờ bán.',
      "Chỉ xóa được chuồng đã trống (không còn nái, không còn đàn heo con đang nuôi, không có nhật ký cho ăn riêng cho chuồng). Xóa là xóa hẳn.",
    ],
    figure: {
      title: "9. Quản Lý Chuồng Trại",
      action: { label: "Thêm Chuồng", mark: 1 },
      table: {
        columns: ["Chuồng", "Loại", "Sức chứa", "Đang ở"],
        rows: [["Chuồng Nái 01", "Chuồng đẻ", "20", "12/20"]],
      },
      dialog: {
        title: "Thêm Chuồng",
        fields: [
          { label: "Tên chuồng *", value: "Chuồng Nái 01", mark: 2 },
          { label: "Loại chuồng", value: "Chuồng đẻ" },
          { label: "Sức chứa tối đa *", value: "20" },
          { label: "Mô tả", value: "Dãy A" },
        ],
        submit: "Lưu Chuồng",
        mark: 3,
      },
    },
  },
  {
    id: "heo-nai",
    title: "2. Thêm heo nái",
    href: "/sows",
    intro:
      "Khai báo từng nái với mã riêng, giống, ngày sinh, cân nặng và chuồng đang ở.",
    steps: [
      { text: 'Vào "1. Quản Lý Đàn Heo Nái" rồi bấm "Thêm Nái Mới".' },
      {
        text: "Nhập mã nái (ví dụ NAI-026, không trùng), giống, ngày sinh, trọng lượng (kg).",
      },
      {
        text: "Chọn vị trí chuồng và trạng thái: Hậu bị, Chờ phối, Mang thai, Đang nuôi con hoặc Loại thải.",
      },
      {
        text: "Bấm lưu. Có thể tìm nái theo mã và lọc theo trạng thái ở thanh trên bảng.",
      },
    ],
    tips: [
      "Trạng thái nái tự đổi theo công việc: ghi nhận phối giống → Mang thai; ghi nhận ca sinh → Đang nuôi con và số lứa tăng thêm 1; phối không đậu → Chờ phối.",
      "Nái đã Loại thải không phối được nữa. Nái đang Mang thai không chọn được ở form phối giống.",
    ],
    figure: {
      title: "1. Quản Lý Đàn Heo Nái",
      action: { label: "Thêm Nái Mới", mark: 1 },
      table: {
        columns: ["Mã nái", "Giống", "Trạng thái", "Chuồng"],
        rows: [["NAI-01", "Yorkshire", "Chờ phối", "Chuồng Nái 01"]],
      },
      dialog: {
        title: "Thêm Nái Mới",
        fields: [
          { label: "Mã heo nái *", value: "NAI-026", mark: 2 },
          { label: "Giống heo *", value: "Landrace", select: true },
          { label: "Ngày sinh *", value: "2025/08/10" },
          { label: "Trọng lượng (kg) *", value: "180" },
          {
            label: "Vị trí chuồng *",
            value: "Chuồng Nái 01",
            select: true,
            mark: 3,
          },
          { label: "Trạng thái", value: "Chờ phối", select: true },
        ],
        submit: "Lưu Nái",
        mark: 4,
      },
    },
  },
  {
    id: "phoi-giong",
    title: "3. Phối giống và theo dõi kết quả",
    href: "/matings",
    intro:
      "Trang này có hai tab: Nhật ký phối giống và Heo đực / tinh. Thêm nguồn đực / tinh trước, rồi ghi nhận từng lần phối.",
    steps: [
      {
        text: 'Sang tab "Heo đực / tinh", bấm "Thêm Heo Đực / Tinh" và nhập mã, giống (chỉ OWNER và MANAGER thêm được).',
      },
      { text: 'Quay lại tab "Nhật ký phối giống", bấm "Ghi Nhận Phối Giống".' },
      {
        text: "Chọn nái và heo đực / tinh, nhập ngày động dục, ngày phối (không trước ngày động dục), số lần phối.",
      },
      {
        text: "Ngày dự kiến sinh = ngày phối + 114 ngày, hệ thống tự tính và hiện ngay dưới form.",
      },
      {
        text: 'Khi biết kết quả, bấm biểu tượng sửa ở dòng đó và chọn "Đã đậu thai" hoặc "Không đậu".',
      },
    ],
    tips: [
      'Lần phối mới tạo luôn là "Mới phối" (form tạo không có ô kết quả). Lúc đang "Mới phối", form sửa chỉ cho đổi kết quả, các ô khác bị khóa.',
      'Lần phối "Đã đậu thai" thì chốt, không đổi kết quả nữa. Lần "Không đậu" có thể chọn "Phối lại" để quay về "Mới phối".',
      'Ngày thai và tiến trình mang thai chỉ bắt đầu tính khi kết quả là "Đã đậu thai".',
    ],
    figure: {
      title: "2. Quản Lý Phối Giống",
      tabs: {
        labels: ["Nhật ký phối giống", "Heo đực / tinh"],
        active: 0,
        mark: 1,
      },
      action: { label: "Ghi Nhận Phối Giống", mark: 2 },
      table: {
        columns: ["Mã nái", "Ngày phối", "Kết quả", "Dự kiến sinh"],
        rows: [["NAI-02", "09/10/2026", "Mới phối", "31/01/2027"]],
      },
      dialog: {
        title: "Ghi Nhận Phối Giống",
        fields: [
          { label: "Chọn nái phối *", value: "NAI-02", select: true, mark: 3 },
          { label: "Heo đực / Tinh *", value: "TINH-01", select: true },
          { label: "Ngày động dục *", value: "2026/10/08" },
          { label: "Ngày phối *", value: "2026/10/09" },
        ],
        submit: "Lưu Phối Giống",
        note: "Dự kiến sinh (114 ngày): 31/01/2027",
        noteMark: 4,
      },
    },
  },
  {
    id: "thai-ky",
    title: "4. Theo dõi thai kỳ",
    href: "/gestation",
    intro:
      "Mỗi nái đang mang thai là một thẻ, cho biết tiến độ thai, ngày dự kiến sinh, thức ăn và vaccine thai kỳ.",
    steps: [
      {
        text: 'Nái mới phối hiện nhãn "Chờ xác nhận đậu thai". Hãy cập nhật kết quả ở trang Phối giống.',
      },
      {
        text: 'Khi đã đậu thai, thẻ hiện "Ngày thai x/114" và thanh tiến trình.',
      },
      {
        text: 'Nút "Ghi Nhận Ca Sinh" chỉ mở khi còn không quá 7 ngày đến ngày dự kiến sinh (hoặc đã quá ngày). Bấm vào để sang trang Sinh sản với nái đã được chọn sẵn.',
      },
    ],
    tips: [
      'Chưa tới hạn thì dưới nút hiện dòng "Còn X ngày nữa mới đến ngày dự kiến sinh".',
    ],
    figure: {
      title: "3. Theo Dõi Mang Thai & Thai Kỳ",
      cards: [
        {
          title: "NAI-02",
          lines: ["Ngày thai: 3/114", "Dự kiến đẻ: 30/01/2027"],
          button: { label: "Ghi Nhận Ca Sinh", mark: 3, disabled: true },
        },
        {
          title: "NAI-03",
          lines: ["Chờ xác nhận đậu thai", "Dự kiến đẻ: 06/02/2027"],
          badge: "Chờ",
          button: { label: "Ghi Nhận Ca Sinh", mark: 1, disabled: true },
        },
      ],
    },
  },
  {
    id: "sinh-san",
    title: "5. Ghi nhận ca sinh",
    href: "/farrowings",
    intro:
      "Ghi số con sinh ra. Hệ thống tự cập nhật nái và tạo luôn đàn heo con.",
    steps: [
      { text: 'Bấm "Ghi Nhận Ca Sinh" (hoặc đi từ thẻ nái ở trang Thai kỳ).' },
      {
        text: "Chọn nái mẹ (chỉ liệt kê nái đang mang thai). Ngày sinh mặc định là ngày dự kiến nếu đã tới, và không được ở tương lai.",
      },
      {
        text: "Chọn chuồng đẻ: tự tạo chuồng mới, giữ chuồng hiện tại hoặc chuyển vào chuồng còn chỗ.",
      },
      {
        text: "Nhập số con sống (bắt buộc), con chết, con yếu (nằm trong số con sống) và trọng lượng sơ sinh.",
      },
      { text: 'Bấm "Lưu Ca Sinh".' },
    ],
    tips: [
      'Sau khi lưu: nái chuyển sang "Đang nuôi con", số lứa tăng 1, tự tạo đàn heo con mã DAN-<mã nái>-<ngày sinh> với ngày cai sữa dự kiến sau 28 ngày.',
      "Ngày sinh được chọn trong khoảng ±1 tháng quanh ngày dự kiến sinh.",
    ],
    figure: {
      title: "4. Quản Lý Sinh Sản (Nái Đẻ)",
      action: { label: "Ghi Nhận Ca Sinh", mark: 1 },
      table: {
        columns: ["Nái mẹ", "Ngày sinh", "Sống", "Chết"],
        rows: [["NAI-01", "20/09/2026", "10", "1"]],
      },
      dialog: {
        title: "Ghi Nhận Nái Sinh Sản",
        fields: [
          { label: "Mã nái mẹ *", value: "NAI-02", select: true, mark: 2 },
          { label: "Ngày sinh *", value: "2027/01/30" },
          {
            label: "Chuồng đẻ",
            value: "Tự động tạo chuồng mới",
            select: true,
            mark: 3,
          },
          { label: "Số con sống *", value: "12", mark: 4 },
          { label: "Số con chết", value: "1" },
          { label: "Số con yếu", value: "3" },
        ],
        submit: "Lưu Ca Sinh",
        mark: 5,
      },
    },
  },
  {
    id: "heo-con",
    title: "6. Quản lý đàn heo con và cai sữa",
    href: "/piglets",
    intro:
      "Trang có hai bảng: Đàn heo & cai sữa (heo đang nuôi) và Heo đang chờ bán (heo đã có phiếu bán).",
    steps: [
      {
        text: 'Ở tab "Đàn heo & cai sữa", bấm biểu tượng sửa để đổi giai đoạn: Bú mẹ → Cai sữa → Nuôi thịt, cập nhật trọng lượng, sức khỏe, chuồng.',
      },
      {
        text: 'Khi có con chết, bấm nút "Ghi nhận" ở cột "Con Chết", nhập số con, ngày, lý do. Số lượng của đàn tự giảm và lưu thành nhật ký sức khỏe.',
      },
      {
        text: 'Tab "Heo đang chờ bán" chỉ để xem và xóa. Xóa ở đây nghĩa là hủy phiếu bán, số con được trả về đàn gốc.',
      },
    ],
    tips: [
      "Số lượng đàn không sửa tay được, chỉ đổi qua phiếu bán hoặc ghi nhận con chết, để số con luôn kiểm soát được. Ghi nhầm con chết thì xóa nhật ký, số con được cộng lại.",
      'Đàn nhập từ ngoài có thể tạo bằng nút "Tạo Đàn Heo Mới" (nhập số lượng ngay lúc tạo).',
    ],
    figure: {
      title: "5. Quản Lý Đàn Heo Con & Cai Sữa",
      tabs: {
        labels: ["Đàn heo & cai sữa (3)", "Heo đang chờ bán (1)"],
        active: 0,
      },
      table: {
        columns: ["Mã đàn", "Số lượng", "Giai đoạn", "Con chết"],
        rows: [["DAN-NAI-01-...", "10 con", "Bú mẹ", "Ghi nhận"]],
        mark: 2,
      },
    },
  },
  {
    id: "thuc-an",
    title: "7. Thức ăn và cám",
    href: "/feeds",
    intro:
      "Khai báo loại cám rồi ghi nhận mỗi lần cho ăn. Chi phí cám tự vào sổ chi phí.",
    steps: [
      {
        text: 'Sang tab "Loại cám" và bấm "Thêm Loại Cám": mã, tên, giá mặc định mỗi kg. Hệ thống đã có sẵn vài loại để dùng ngay.',
      },
      { text: 'Quay lại tab "Nhật ký cho ăn" và bấm "Ghi Nhận Cho Ăn".' },
      {
        text: "Chọn ngày, loại cám, chuồng sử dụng, số lượng (kg), kg/con/ngày nếu muốn theo dõi định lượng, đơn giá / kg.",
      },
      {
        text: "Để trống đơn giá thì dùng giá mặc định của loại cám. Tổng tiền = số kg × đơn giá.",
      },
    ],
    tips: [
      'Mỗi lần ghi nhận cho ăn tạo một khoản chi trong danh mục "Thức ăn" của sổ chi phí, sửa hoặc xóa nhật ký thì khoản chi đi theo.',
    ],
    figure: {
      title: "6. Quản Lý Thức Ăn & Cám",
      tabs: { labels: ["Nhật ký cho ăn", "Loại cám"], active: 0, mark: 1 },
      action: { label: "Ghi Nhận Cho Ăn", mark: 2 },
      table: {
        columns: ["Ngày", "Loại cám", "Số kg", "Tổng tiền"],
        rows: [["12/10/2026", "Cám Heo Thịt (C22)", "100", "20.000.000 đ"]],
      },
      dialog: {
        title: "Ghi Nhận Cho Ăn",
        fields: [
          { label: "Ngày *", value: "2026/10/12" },
          {
            label: "Loại cám *",
            value: "Cám Heo Thịt (C22)",
            select: true,
            mark: 3,
          },
          { label: "Chuồng sử dụng *", value: "Chuồng Nái 01", select: true },
          { label: "Số lượng (kg) *", value: "100" },
        ],
        submit: "Lưu Nhật Ký",
        mark: 4,
      },
    },
  },
  {
    id: "vaccine",
    title: "8. Vaccine và sức khỏe",
    href: "/health",
    intro:
      "Trang có 3 tab: nhật ký sức khỏe của heo nái, của heo con, và Danh mục vaccine để chọn nhanh khi ghi nhận.",
    steps: [
      {
        text: 'Tab "Danh mục vaccine": xem các vaccine cơ bản có sẵn, bấm "Thêm Vaccine" để thêm. Nhập tên, liều mặc định, chi phí mặc định cho mỗi con và tick mốc quy trình heo con dùng vaccine đó.',
      },
      {
        text: 'Tab "Heo nái" hoặc "Heo con": bấm "Ghi Nhận Sức Khỏe", chọn nái hoặc đàn.',
      },
      {
        text: 'Chọn "Vaccine trong danh mục": tên, liều, chi phí tự điền (vẫn sửa được). Với đàn heo con, chi phí = chi phí mỗi con × số con của đàn.',
      },
      {
        text: 'Hoặc chọn "Nhập tay" để tự gõ tên: vaccine mới sẽ được tự lưu vào danh mục để lần sau chọn.',
      },
      {
        text: "Có chi phí thì khoản chi tự ghi vào sổ chi phí (danh mục Thuốc / Vaccine).",
      },
    ],
    tips: [
      'Ghi nhận "Chết / loại thải" cho đàn heo con cần nhập số con chết (xem mục Đàn heo con).',
      "Nhật ký chết đã ghi không sửa được phân loại và số con, muốn đổi thì xóa rồi ghi lại.",
    ],
    figure: {
      title: "7-8. Quản Lý Thuốc, Vaccine & Sức Khỏe",
      tabs: {
        labels: ["Heo nái (1)", "Heo con (3)", "Danh mục vaccine (5)"],
        active: 2,
        mark: 1,
      },
      action: { label: "Thêm Vaccine", mark: 1 },
      table: {
        columns: ["Tên vaccine", "Liều", "Chi phí / con", "Mốc"],
        rows: [["Vaccine dịch tả heo", "2ml", "300.000 đ", "21-30, 50-60"]],
      },
    },
  },
  {
    id: "tiem-vaccine",
    title: "9. Theo dõi tiêm vaccine heo con",
    href: "/piglet-care",
    intro:
      "Mỗi đàn heo con có 7 mũi vaccine theo tuổi. Trang này cho biết mũi nào đến hạn, quá hạn và ghi nhận khi đã tiêm.",
    steps: [
      {
        text: "Bảng liệt kê các đàn đang nuôi với tuổi, số con, số mũi đã tiêm, mũi đến hạn và quá hạn. Đàn nhiều mũi quá hạn nằm trên cùng.",
      },
      {
        text: "Bấm vào một đàn để xem đủ 7 mũi với trạng thái Đã tiêm / Đến hạn / Quá hạn / Chưa đến.",
      },
      {
        text: 'Bấm "Đã tiêm" ở mũi đó: vaccine được chọn sẵn theo mốc, nhập ngày tiêm, liều và chi phí / con. Tổng chi phí = chi phí / con × số con của đàn.',
      },
      {
        text: 'Bấm "Bỏ đánh dấu" nếu ghi nhầm (OWNER và MANAGER), khoản chi liên quan cũng bị xóa.',
      },
    ],
    tips: [
      "Đàn đã bán hoặc đang chờ bán không nằm trong bảng này vì quy trình được theo dõi ở đàn gốc.",
      'Xem bảng quy trình đầy đủ (kể cả chăm sóc, tiêm sắt, cai sữa) ở trang "Quy Trình Vaccine Heo Con".',
    ],
    figure: {
      title: "Theo Dõi Tiêm Vaccine Heo Con",
      table: {
        columns: ["Mã đàn", "Tuổi", "Đã tiêm", "Quá hạn"],
        rows: [["DAN-NAI-02-...", "32", "4/7", "—"]],
        mark: 1,
      },
      dialog: {
        title: "Ghi nhận tiêm - DAN-NAI-02",
        fields: [
          {
            label: "Vaccine",
            value: "Vaccine dịch tả heo",
            select: true,
            mark: 3,
          },
          { label: "Ngày tiêm *", value: "2026/10/12" },
          { label: "Liều dùng", value: "2ml" },
          { label: "Chi phí / con", value: "300.000" },
        ],
        note: "Số con: 9 · Tổng chi phí: 2.700.000 đ",
        submit: "Lưu Mũi Tiêm",
      },
    },
  },
  {
    id: "ban-heo",
    title: "10. Bán heo và hóa đơn",
    href: "/sales",
    intro:
      "Tạo phiếu bán cho đàn đã cai sữa hoặc đủ 1 tháng tuổi. Heo bán được chuyển vào chuồng chờ bán cho đến ngày giao.",
    steps: [
      {
        text: 'Tab "Người mua": bấm "Thêm Người Mua" (tên, số điện thoại). Hoặc chọn "+ Nhập tay (người mua mới)" ngay trong form phiếu bán, người mới tự lưu vào danh sách.',
      },
      { text: 'Tab "Phiếu bán heo": bấm "Tạo Phiếu Bán Heo".' },
      {
        text: "Chọn ngày bán, ngày vận chuyển, đàn bán (không chọn được đàn đã có phiếu bán), người mua.",
      },
      {
        text: 'Chuồng chờ bán: để "Tự động" (dùng chuồng trống, hết thì tạo Chuồng chờ bán-02, -03...) hoặc chọn một chuồng đang trống.',
      },
      {
        text: 'Nhập số lượng, tổng trọng lượng (kg), giá / kg. Tổng tiền tự tính. Bấm "Lưu Hóa Đơn".',
      },
    ],
    tips: [
      "Bán một phần đàn thì đàn được tách: phần bán thành đàn mới (mã có đuôi -B1, -B2) sang chuồng chờ bán, phần còn lại ở nguyên chuồng.",
      'Từ 00:00 ngày sau ngày vận chuyển: phiếu không sửa được nữa, heo chuyển sang "Đã bán" và chuồng chờ bán trở về Trống để dùng lại.',
      'Muốn hủy phiếu thì xóa phiếu (OWNER) hoặc xóa dòng ở tab "Heo đang chờ bán": số con trả về đàn gốc.',
    ],
    figure: {
      title: "10. Quản Lý Bán Heo & Hóa Đơn",
      tabs: { labels: ["Phiếu bán heo", "Người mua"], active: 0, mark: 1 },
      action: { label: "Tạo Phiếu Bán Heo", mark: 2 },
      table: {
        columns: ["Ngày bán", "Đàn", "Số lượng", "Tổng tiền"],
        rows: [["12/10/2026", "DAN-NAI-03-...-B1", "5 con", "9.000.000 đ"]],
      },
      dialog: {
        title: "Tạo Phiếu Bán Heo",
        fields: [
          { label: "Ngày bán *", value: "2026/10/12", mark: 3 },
          { label: "Ngày vận chuyển", value: "2026/10/14" },
          { label: "Đàn bán *", value: "DAN-NAI-03-... (8 con)", select: true },
          { label: "Người mua", value: "Anh Hùng", select: true },
          { label: "Chuồng chờ bán", value: "Tự động", select: true, mark: 4 },
          { label: "Số lượng *", value: "5" },
        ],
        submit: "Lưu Hóa Đơn",
        mark: 5,
      },
    },
  },
  {
    id: "chi-phi",
    title: "11. Sổ chi phí",
    href: "/expenses",
    intro:
      "Mọi khoản chi của trại: con giống, thức ăn, thuốc, điện, nước, nhân công, chuồng trại, vận chuyển...",
    steps: [
      {
        text: 'Tab "Danh mục": đã có sẵn các danh mục thường dùng, bấm "Thêm Danh Mục" để thêm danh mục riêng.',
      },
      {
        text: 'Tab "Sổ chi phí": bấm "Ghi Nhận Chi Phí", chọn danh mục, ngày, số tiền và mô tả.',
      },
      { text: "Lọc theo danh mục hoặc tìm theo mô tả ở thanh trên bảng." },
    ],
    tips: [
      "Chi phí cám và thuốc / vaccine tự được ghi từ nhật ký cho ăn và nhật ký sức khỏe, bạn không cần nhập lại. Muốn sửa thì sửa ở nhật ký gốc.",
    ],
    figure: {
      title: "11. Sổ Sách Quản Lý Chi Phí",
      tabs: { labels: ["Sổ chi phí", "Danh mục"], active: 0, mark: 1 },
      action: { label: "Ghi Nhận Chi Phí", mark: 2 },
      table: {
        columns: ["Ngày", "Danh mục", "Mô tả", "Số tiền"],
        rows: [["12/10/2026", "Thức ăn", "Cho ăn: Cám C22", "20.000.000 đ"]],
      },
    },
  },
  {
    id: "doanh-thu",
    title: "12. Doanh thu, lợi nhuận và hiệu quả",
    href: "/profit",
    intro:
      "Báo cáo tự tổng hợp từ phiếu bán và sổ chi phí, không cần nhập thêm.",
    steps: [
      {
        text: 'Chọn khoảng ngày (Từ ngày - Đến ngày) hoặc bấm nhanh "Tháng này", "Năm nay", "Toàn bộ thời gian".',
      },
      {
        text: "Ba ô tổng cho doanh thu, chi phí và lợi nhuận ròng kèm biên lợi nhuận. Bảng theo tháng liệt kê từng tháng.",
      },
      {
        text: 'Tab "Heo nái": doanh thu từ các đàn con của nái, chi phí thuốc / vaccine và cám của nái.',
      },
      {
        text: 'Tab "Heo con": mỗi dòng là một đàn gốc (đàn tách khi bán đã gộp lại) với Tổng số con = hiện tại + đã bán + đã chết, cùng doanh thu và chi phí.',
      },
    ],
    tips: [
      "Điện, nước, nhân công dùng chung nên chỉ tính vào tổng chi phí, không chia cho từng nái hay đàn.",
    ],
    figure: {
      title: "12. Doanh Thu, Lợi Nhuận & Hiệu Quả Nái",
      stats: [
        { label: "Doanh thu", value: "9.000.000 đ", tone: "success" },
        { label: "Chi phí", value: "82.000.000 đ", tone: "danger" },
        { label: "Lợi nhuận", value: "-73.000.000 đ", tone: "danger" },
      ],
      tabs: { labels: ["Heo nái (3)", "Heo con (3)"], active: 1, mark: 3 },
      table: {
        columns: ["Mã đàn", "Tổng", "Hiện tại", "Đã bán"],
        rows: [["DAN-NAI-03-...", "8", "3", "5"]],
      },
    },
  },
  {
    id: "lich",
    title: "13. Lịch nhắc việc và cảnh báo",
    href: "/calendar",
    intro:
      "Gom các việc sắp đến hạn: lịch phối, dự kiến đẻ, tiêm vaccine, cai sữa và các việc bạn tự thêm.",
    steps: [
      {
        text: 'Mở "14. Lịch & Cảnh Báo Sắp Tới" từ menu, hoặc bấm "Xem lịch & cảnh báo" ở cuối danh sách thông báo (biểu tượng chuông ở thanh trên cùng).',
      },
      {
        text: 'Bấm "Thêm Nhắc Việc" để tạo việc riêng với tiêu đề, ngày và ghi chú.',
      },
      {
        text: "Việc quá hạn và sắp đến hạn được tô màu để dễ thấy. Xóa nhắc việc bằng biểu tượng thùng rác (OWNER và MANAGER).",
      },
    ],
    figure: {
      title: "14. Lịch Nhắc Việc & Cảnh Báo",
      action: { label: "Thêm Nhắc Việc", mark: 2 },
      table: {
        columns: ["Ngày", "Việc cần làm", "Loại"],
        rows: [["13/10/2026", "Dự kiến cai sữa DAN-NAI-02", "Cai sữa"]],
      },
    },
  },
];

export const GUIDE_FAQ: { q: string; a: string }[] = [
  {
    q: 'Vì sao nút "Ghi Nhận Ca Sinh" ở trang Thai kỳ bị khóa?',
    a: 'Nút chỉ mở khi lần phối đã được đánh dấu "Đã đậu thai" và còn không quá 7 ngày đến ngày dự kiến sinh. Hãy cập nhật kết quả ở trang Phối giống.',
  },
  {
    q: "Vì sao không chọn được nái ở form phối giống?",
    a: "Nái đang Mang thai hoặc đã Loại thải không phối được. Chờ nái sinh xong (chuyển sang Đang nuôi con) hoặc đổi trạng thái nái nếu nhập sai.",
  },
  {
    q: "Vì sao không sửa được số lượng của đàn heo con?",
    a: 'Số lượng chỉ đổi qua phiếu bán hoặc ghi nhận con chết để luôn kiểm soát được. Có con chết thì dùng nút "Ghi nhận" ở cột "Con Chết".',
  },
  {
    q: "Vì sao không sửa được phiếu bán?",
    a: "Từ 00:00 ngày sau ngày vận chuyển, phiếu bán và heo chờ bán bị khóa. Cần hủy thì xóa phiếu, số con trả về đàn gốc.",
  },
  {
    q: "Vì sao không xóa được chuồng?",
    a: "Chuồng còn nái, còn đàn heo con đang nuôi hoặc có nhật ký cho ăn riêng cho chuồng thì không xóa được. Chuyển hết heo đi rồi xóa lại.",
  },
  {
    q: 'Ngày sinh báo "không được ở tương lai"?',
    a: "Chỉ ghi nhận ca sinh khi nái đã đẻ, hãy chọn ngày sinh thực tế (từ hôm nay trở về trước).",
  },
  {
    q: "Ghi nhầm mũi tiêm hoặc ghi nhầm con chết thì sao?",
    a: 'Xóa nhật ký ghi nhầm (OWNER hoặc MANAGER). Với con chết, số con được cộng lại vào đàn. Với mũi tiêm, bấm "Bỏ đánh dấu" ở trang Theo dõi tiêm vaccine.',
  },
];
