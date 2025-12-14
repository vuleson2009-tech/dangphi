import { GoogleGenAI, Type } from "@google/genai";
import { ColumnDefinition, SheetRow } from "../types";

const apiKey = process.env.API_KEY;
// Note: In a real production app, API keys should be handled via a backend proxy. 
// For this client-side demo, we assume the environment variable is injected.

const ai = new GoogleGenAI({ apiKey: apiKey });

export const extractDataFromText = async (
  text: string, 
  columns: ColumnDefinition[]
): Promise<SheetRow[]> => {
  if (!text.trim()) return [];

  // Get current date context for relative date parsing (e.g., "hôm qua", "thứ 2 tuần trước")
  const now = new Date();
  const todayStr = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const todayISO = now.toISOString().split('T')[0];

  const columnNames = columns.map(c => c.label).join(", ");
  
  // Construct a schema based on the user's defined columns
  const properties: Record<string, any> = {};
  columns.forEach(col => {
    let propType = Type.STRING;
    if (col.type === 'number' || col.type === 'currency') propType = Type.NUMBER;
    
    properties[col.id] = {
      type: propType,
      description: `Value for column '${col.label}'`,
    };
  });

  const systemInstruction = `
    Bạn là một chuyên gia nhập liệu thông minh (Smart Data Extraction AI).
    Nhiệm vụ: Phân tích văn bản ngôn ngữ tự nhiên (Tiếng Việt hoặc Tiếng Anh) và trích xuất thành dữ liệu bảng tính JSON có cấu trúc chính xác.

    Thông tin ngữ cảnh thời gian thực:
    - Hôm nay là: ${todayStr} (ISO Format: ${todayISO}).
    - Hãy sử dụng ngày này làm mốc chuẩn để tính toán các từ chỉ thời gian tương đối như "hôm qua", "hôm kia", "tuần trước", "sáng nay".

    Cấu trúc bảng dữ liệu yêu cầu (các cột):
    ${columns.map(c => `- ID: ${c.id} (Tên hiển thị: ${c.label}) - Kiểu dữ liệu: ${c.type}`).join('\n')}

    Quy tắc xử lý quan trọng:
    1. **Tách dòng thông minh**: Nếu văn bản chứa nhiều mục chi tiêu hoặc sự kiện riêng biệt (ví dụ: "Phở 50k và Cafe 30k", hoặc "Sáng đổ xăng, chiều đi siêu thị"), hãy tách chúng thành nhiều dòng dữ liệu (items) riêng biệt trong mảng kết quả.
    2. **Xử lý Tiền tệ**: 
       - Chuyển đổi mọi định dạng tiền tệ về số nguyên (VNĐ).
       - Hậu tố "k", "ngàn", "nghìn" = x1000 (ví dụ: "50k" -> 50000, "20" trong ngữ cảnh mua bán nhỏ thường là 20000).
       - Hậu tố "tr", "triệu", "m" = x1000000.
    3. **Ngày tháng**: 
       - Luôn định dạng chuẩn ISO: YYYY-MM-DD.
       - Nếu không có ngày cụ thể, mặc định là ngày hôm nay (${todayISO}).
    4. **Suy luận thông minh (Inference)**: 
       - Nếu cột phân loại (category) tồn tại nhưng thiếu thông tin, hãy tự suy luận logic dựa trên nội dung (item). Ví dụ: "Ăn phở" -> "Ăn uống", "Grab" -> "Di chuyển", "Thu tiền nhà" -> "Thu nhập/Nhà cửa".
       - Tự động điền các trường hợp lý dựa trên ngữ cảnh.
    5. **Xử lý lỗi**: Nếu một trường bắt buộc không có thông tin và không thể suy luận, hãy để trống hoặc giá trị mặc định (0).

    Ví dụ mẫu (Few-shot prompting):
    Input: "Sáng nay ăn bánh mì 20k, trưa nay cơm tấm 45k. Hôm qua đổ xăng hết 100k."
    Output mong đợi:
    [
      { "date": "${todayISO}", "item": "Bánh mì", "amount": 20000, "category": "Ăn uống", "note": "Sáng nay" },
      { "date": "${todayISO}", "item": "Cơm tấm", "amount": 45000, "category": "Ăn uống", "note": "Trưa nay" },
      { "date": "[Ngày hôm qua ISO]", "item": "Đổ xăng", "amount": 100000, "category": "Di chuyển", "note": "" }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: text, // The user input is the direct content
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: properties,
            required: columns.map(c => c.id),
          }
        },
        temperature: 0.1, // Low temperature for more deterministic/factual extraction
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from AI");

    return JSON.parse(jsonText) as SheetRow[];
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Không thể xử lý dữ liệu. Vui lòng kiểm tra lại văn bản đầu vào hoặc thử lại sau.");
  }
};