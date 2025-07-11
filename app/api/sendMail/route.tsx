import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    // Captura os dados enviados pelo formulário
    const { name, email, phone, message, formType } = await req.json();

    // Define o e-mail de destino conforme o tipo de formulário
    let toEmail = "info@prime2place.com.br";
    let subject = "Novo contato recebido";
    switch (formType) {
      case "parceria":
        toEmail = "parceria@prime2place.com";
        subject = "Nova solicitação de parceria";
        break;
      case "visita":
        toEmail = "visita@prime2place.com";
        subject = "Novo agendamento de visita";
        break;
      case "contato":
        toEmail = "info@prime2place.com";
        subject = "Novo contato recebido";
        break;
      case "aluguel":
        toEmail = "info@prime2place.com";
        subject = "Solicitação de aluguel";
        break;
      case "venda":
        toEmail = "info@prime2place.com";
        subject = "Solicitação de venda";
        break;
      case "lancamento":
        toEmail = "info@prime2place.com";
        subject = "Interesse em lançamento";
        break;
      case "planta":
        toEmail = "planta@prime2place.com";
        subject = "Solicitação de planta baixa";
        break;
      default:
        toEmail = "info@prime2place.com";
        subject = "Novo contato recebido";
    }

    // Configura o Nodemailer com SMTP do Gmail
    const transporter = nodemailer.createTransport({
      host: "smtplw.com.br",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // ✅ Isso evita o erro de certificado em localhost
      },
    });

    // Define os dados do e-mail
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: subject,
      text: `\n        Essa pessoa preencheu o formulário:\n\n        Nome: ${name}\n        Email: ${email}\n        Celular: ${phone}\n        Mensagem: ${message}\n      `,
    };

    // Envia o e-mail
    await transporter.sendMail(mailOptions);

    // Resposta de sucesso
    return NextResponse.json(
      { message: "Email enviado com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao enviar o email:", error);
    // Resposta de erro
    return NextResponse.json(
      { message: "Falha ao enviar o email." },
      { status: 500 }
    );
  }
}
