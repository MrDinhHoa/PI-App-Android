"""
Script thử nghiệm giọng cô giáo mầm non bằng Google Gemini Interactions API (gemini-3.8-flash-tts).
Tạo file WAV chất lượng cao với biểu cảm cô giáo mầm non siêu truyền cảm.
"""

import os
import sys
import base64

def load_env_file():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())

def main():
    load_env_file()
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("[Lỗi] Không tìm thấy GEMINI_API_KEY trong file .env hoặc môi trường!")
        return

    try:
        from google import genai
    except ImportError:
        print("[Lỗi] Thư viện google-genai chưa được cài đặt. Chạy: python -m pip install google-genai")
        return

    # Khởi tạo Client với API version v1beta cho Interactions API TTS
    client = genai.Client(api_key=api_key, http_options={"api_version": "v1beta"})

    output_dir = os.path.join(os.path.dirname(__file__), "audio", "test_gemini")
    os.makedirs(output_dir, exist_ok=True)

    test_cases = [
        {
            "filename": "1_aoede_khen_ngoi.wav",
            "title": "Mẫu 1: Khen ngợi (Giọng Aoede - Ấm áp, vui tươi, cười nhẹ)",
            "text": "Bé giỏi quá! Hoan hô bé yêu của cô nào!",
            "voice": "Aoede",
            "style": "cheerful, loving, smiling warmly, Vietnamese kindergarten teacher praising a 5-year-old child"
        },
        {
            "filename": "2_kore_khen_ngoi.wav",
            "title": "Mẫu 2: Khen ngợi (Giọng Kore - Trong trẻo, phấn khởi, đáng yêu)",
            "text": "Bé giỏi quá! Hoan hô bé yêu của cô nào!",
            "voice": "Kore",
            "style": "cheerful, playful, enthusiastic, friendly Vietnamese preschool teacher clapping hands"
        },
        {
            "filename": "3_aoede_hoc_chu.wav",
            "title": "Mẫu 3: Học chữ cái (Giọng Aoede - Dạy chữ rõ ràng, hào hứng)",
            "text": "Chữ A. A... quả táo thơm ngon ngọt lịm!",
            "voice": "Aoede",
            "style": "clear, warm, engaging, teaching Vietnamese alphabet phonics to children"
        },
        {
            "filename": "4_kore_hoc_chu.wav",
            "title": "Mẫu 4: Học chữ cái (Giọng Kore - Tươi vui, cuốn hút)",
            "text": "Chữ A. A... quả táo thơm ngon ngọt lịm!",
            "voice": "Kore",
            "style": "bright, expressive, clear phonics pronunciation for preschool learners"
        },
        {
            "filename": "5_aoede_dong_vien.wav",
            "title": "Mẫu 5: Dỗ dành, động viên (Giọng Aoede - Dịu dàng, kiên nhẫn)",
            "text": "Không sao đâu con yêu, chúng mình cùng thử lại nhé. Con làm được mà!",
            "voice": "Aoede",
            "style": "gentle, patient, comforting and reassuring motherly kindergarten teacher"
        }
    ]

    print("\n" + "="*65)
    print(" BẮT ĐẦU SINH THỬ GIỌNG CÔ GIÁO MẦM NON VỚI GOOGLE GEMINI 3.8 TTS")
    print("="*65)

    for i, item in enumerate(test_cases, 1):
        out_file = os.path.join(output_dir, item["filename"])
        print(f"\n[{i}/{len(test_cases)}] Đang tạo: {item['title']}...")
        print(f"      Câu nói: \"{item['text']}\"")

        try:
            interaction = client.interactions.create(
                model="gemini-3.8-flash-tts",
                input=[{
                    "type": "user_input",
                    "content": [{
                        "type": "text",
                        "text": item["text"],
                        "annotations": [{
                            "type": "speech_metadata",
                            "style": item["style"],
                        }],
                    }],
                }],
                response_format={"type": "audio"},
                generation_config={
                    "speech_config": [
                        {"voice": item["voice"]}
                    ]
                },
            )

            if interaction.output_audio and interaction.output_audio.data:
                audio_bytes = base64.b64decode(interaction.output_audio.data)
                with open(out_file, "wb") as f:
                    f.write(audio_bytes)
                size_kb = len(audio_bytes) / 1024
                print(f"       Thành công! Đã lưu: {item['filename']} ({size_kb:.1f} KB)")
            else:
                print(f"      [!] Không nhận được dữ liệu audio từ Gemini.")
        except Exception as e:
            print(f"      [Lỗi]: {e}")

    print("\n" + "="*65)
    print(f" HOÀN TẤT! Tất cả các file đã được lưu trong thư mục:")
    print(f" {output_dir}")
    print("="*65 + "\n")

if __name__ == "__main__":
    main()
