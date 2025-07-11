"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Substituir useRouter por useParams no App Router

type BuildingDetails = {
  [key: string]: unknown; // Permite qualquer estrutura de dados
};

export default function BuildingDetailsPage() {
  const { id } = useParams(); // Use useParams para obter o ID
  const [building, setBuilding] = useState<BuildingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return; // Aguarda o ID estar disponível

    const fetchBuildingDetails = async () => {
      try {
        const response = await fetch(`/api/newBuilding/${id}`);
        if (!response.ok) {
          throw new Error(`Erro: ${response.statusText}`);
        }

        const data = await response.json();
        setBuilding(data || null);
      } catch (error: unknown) {
        setError(String(error));
      } finally {
        setLoading(false);
      }
    };

    fetchBuildingDetails();
  }, [id]);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!building) return <p>Detalhes não encontrados.</p>;

  return (
    <div>
      <h1>Detalhes do Imóvel</h1>
      <ul>
        {Object.entries(building).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong>{" "}
            {typeof value === "object" && value !== null ? (
              <pre>{JSON.stringify(value, null, 2)}</pre>
            ) : (
              String(value)
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
