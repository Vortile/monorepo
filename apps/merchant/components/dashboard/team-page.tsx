"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { UserPlus, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Staff";
  joinedDate: string;
}

interface TeamPageProps {
  onInviteMember: () => void;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Rajesh Sharma",
    email: "rajesh@sharmafoods.com",
    role: "Admin",
    joinedDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Priya Singh",
    email: "priya@sharmafoods.com",
    role: "Staff",
    joinedDate: "2024-03-20",
  },
  {
    id: "3",
    name: "Amit Kumar",
    email: "amit@sharmafoods.com",
    role: "Staff",
    joinedDate: "2024-05-10",
  },
  {
    id: "4",
    name: "Neha Patel",
    email: "neha@sharmafoods.com",
    role: "Staff",
    joinedDate: "2024-06-22",
  },
  {
    id: "5",
    name: "Vikram Singh",
    email: "vikram@sharmafoods.com",
    role: "Admin",
    joinedDate: "2024-02-05",
  },
];

export const TeamPage = ({ onInviteMember }: TeamPageProps) => {
  const [users, setUsers] = useState<User[]>(mockUsers);

  const handleRemoveUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  const getRoleColor = (role: string) =>
    role === "Admin"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Nome",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Função",
      cell: ({ row }) => (
        <Badge
          className={`${getRoleColor(row.getValue("role") as string)} border-0`}
        >
          {row.getValue("role")}
        </Badge>
      ),
    },
    {
      accessorKey: "joinedDate",
      header: "Data de Entrada",
      cell: ({ row }) => {
        const date = new Date(row.getValue("joinedDate") as string);
        return date.toLocaleDateString("pt-BR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRemoveUser(row.original.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Time</h1>
          <p className="text-muted-foreground">
            Gerencie seus membros da equipe e permissões
          </p>
        </div>
        <Button onClick={onInviteMember} size="lg" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Convidar Membro
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membros do Time</CardTitle>
          <CardDescription>
            {users.length} membro{users.length !== 1 ? "s" : ""} no seu time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            filterPlaceholder="Buscar por nome..."
          />
        </CardContent>
      </Card>

      {/* Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle>Permissões por Função</CardTitle>
          <CardDescription>O que cada função pode fazer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-foreground mb-2">Admin</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Acesso completo a todos os recursos</li>
                <li>• Gerenciar membros da equipe</li>
                <li>• Atualizar configurações da loja</li>
                <li>• Visualizar relatórios e análises</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">Staff</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Gerenciar produtos e catálogo</li>
                <li>• Visualizar pedidos</li>
                <li>• Não pode modificar time ou configurações</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
