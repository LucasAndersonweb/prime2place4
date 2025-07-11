"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // Importando o Link para navegação

type Building = {
  Codigo: string;
  Cidade: string;
  Bairro: string;
  ValorVenda: string; // ValorVenda vem como string na API
};

export default function BuildingPage() {
  const [buildings, setBuildings] = useState<Record<string, Building>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await fetch("/api/getBuilding");
        if (!response.ok) {
          throw new Error(`Erro: ${response.statusText}`);
        }

        const data = await response.json();
        setBuildings(data || {});
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildings();
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  const buildingEntries = Object.entries(buildings); // Converte o objeto em um array de pares [chave, valor]

  return (
    <div>
      <h1>Lista de Imóveis</h1>
      {buildingEntries.length > 0 ? (
        <ul>
          {buildingEntries.map(([key, building]) => (
            <li key={key}>
              <Link href={`/building/${key}`}>
                <p>
                  <strong>Código:</strong> {building.Codigo}
                </p>
                <p>
                  <strong>Cidade:</strong> {building.Cidade}
                </p>
                <p>
                  <strong>Bairro:</strong> {building.Bairro}
                </p>
                <p>
                  <strong>Valor de Venda:</strong>{" "}
                  {Number(building.ValorVenda).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </Link>
              <hr />
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum imóvel encontrado.</p>
      )}
    </div>
  );
}
