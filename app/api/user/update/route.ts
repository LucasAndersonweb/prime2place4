import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    // Verificar o token
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as jwt.JwtPayload;

    // Obter dados do request
    const { name, phoneNumber, password, newPassword } = await request.json();

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Se forneceu senha atual, verificar se está correta
    if (password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Senha atual incorreta" },
          { status: 401 }
        );
      }
    }

    // Preparar dados para atualização
    const updateData: any = {
      name,
      phoneNumber,
    };

    // Se forneceu nova senha, hash ela
    if (newPassword) {
      if (!password) {
        return NextResponse.json(
          { error: "Senha atual é necessária para alterar a senha" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
    });

    // Remover senha do retorno
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}
