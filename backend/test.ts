// test-email.ts   (project ke root mein bana do)
import { Resend } from "resend";

const resend = new Resend("re_96fVQbRk_A16nHZ1vRN7HZYNPDZZfrvNT");

async function test() {
  try {
    const data = await resend.emails.send({
      from: "Aditya Blog App <onboarding@blogapp.resend.dev>",
      to: "aditykbr01@gmail.com",           // ← apna real Gmail daalo jahan check karte ho
      subject: "TEST EMAIL FROM RESEND",
      html: "<h1>Ye test hai bhai! Agar ye aa gaya toh sab working hai</h1>",
    });
    console.log("SUCCESS → Email sent!");
    console.log("Email ID:", data.id);
  } catch (error: any) {
    console.log("ERROR →", error.message);
    if (error.response) console.log(error.response.body);
  }
}

test();