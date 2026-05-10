import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // اعتبارسنجی ادمین
    if (username !== "admin" || password !== "admin1234") {
      return NextResponse.json({ error: "نام کاربری یا رمز عبور اشتباه است." }, { status: 401 });
    }

    // گرفتن لیست نمرات از دیتابیس
    const { rows } = await sql`
      SELECT name, father_name as "fatherName", province, student_id as "studentId", score
      FROM exam_results
      ORDER BY id DESC;
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Admin API Error:', error);
    // اگر دیتابیس وصل نباشد، لیست خالی برمی‌گردانیم تا خطا ندهد
    return NextResponse.json([]);
  }
}
