import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

// Função auxiliar para verificar o token
const verifyToken = (request: Request) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    throw new Error("Token não fornecido");
  }

  const token = authHeader.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET || "") as jwt.JwtPayload;
};

// Middleware para garantir conexão do Prisma
const withPrisma = async (handler: Function, ...args: any[]) => {
  try {
    await prisma.$connect();
    return await handler(...args);
  } catch (error: any) {
    console.error("Prisma error:", error);
    return NextResponse.json(
      { error: "Erro de conexão com o banco de dados" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};

// Listar favoritos
export async function GET(request: Request) {
  return withPrisma(async () => {
    try {
      const decoded = verifyToken(request);

      const favorites = await prisma.favoriteProperty.findMany({
        where: {
          userId: decoded.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(favorites);
    } catch (error: any) {
      console.error("GET error:", error);
      return NextResponse.json(
        { error: error.message || "Erro ao buscar favoritos" },
        { status: 401 }
      );
    }
  });
}

// Adicionar aos favoritos
export async function POST(request: Request) {
  return withPrisma(async () => {
    try {
      const decoded = verifyToken(request);
      const { propertyId } = await request.json();

      if (!propertyId) {
        return NextResponse.json(
          { error: "ID do imóvel não fornecido" },
          { status: 400 }
        );
      }

      const favorite = await prisma.favoriteProperty.create({
        data: {
          userId: decoded.userId,
          propertyId,
        },
      });

      return NextResponse.json(favorite);
    } catch (error: any) {
      console.error("POST error:", error);
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Imóvel já está nos favoritos" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error.message || "Erro ao adicionar aos favoritos" },
        { status: 401 }
      );
    }
  });
}

// Remover dos favoritos
export async function DELETE(request: Request) {
  return withPrisma(async () => {
    try {
      const decoded = verifyToken(request);
      const { searchParams } = new URL(request.url);
      const propertyId = searchParams.get("propertyId");

      if (!propertyId) {
        return NextResponse.json(
          { error: "ID do imóvel não fornecido" },
          { status: 400 }
        );
      }

      await prisma.favoriteProperty.delete({
        where: {
          userId_propertyId: {
            userId: decoded.userId,
            propertyId,
          },
        },
      });

      return NextResponse.json({
        message: "Removido dos favoritos com sucesso",
      });
    } catch (error: any) {
      console.error("DELETE error:", error);
      return NextResponse.json(
        { error: error.message || "Erro ao remover dos favoritos" },
        { status: 401 }
      );
    }
  });
}
