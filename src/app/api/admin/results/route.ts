import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // اعتبارسنجی ادمین
    if (username !== "admin" || password !== "admin1234") {
      return NextResponse.json({ error: "نام کاربری یا رمز عبور اشتباه است." }, { status: 401 });
    }

    // گرفتن لیست نمرات از دیتابیس با فیلدهای درخواستی
    const { rows } = await sql`
      SELECT name, father_name as "fatherName", province, student_id as "studentId", score
      FROM exam_results
      ORDER BY id DESC;
    `;

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Admin API Error:', error);
    // اگر خطای دیتابیس بود، پیام واضح‌تری می‌دهیم
    return NextResponse.json({ error: "خطا در پایگاه داده ویرسل: " + error.message }, { status: 500 });
  }
}
