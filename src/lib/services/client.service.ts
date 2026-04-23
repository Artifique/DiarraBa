// filepath: src/lib/services/client.service.ts
import { createClient } from "@/lib/supabase";
import { ClientModel } from "@/lib/models/client.model";
import { AuditModel } from "@/lib/models/audit.model";
import { Client } from "@/types/database";

const supabase = createClient();
const clientModel = new ClientModel(supabase);
const auditModel = new AuditModel(supabase);

export const clientService = {
  async getAll(): Promise<Client[]> {
    return clientModel.findAll();
  },

  async getById(id: string): Promise<Client | null> {
    return clientModel.findById(id);
  },

  async create(
    data: Omit<Client, "id" | "date_inscription" | "date_modification">,
    managerId: string,
  ): Promise<Client> {
    const client = await clientModel.create(data);

    await auditModel.create({
      manager_id: managerId,
      client_id: client.id,
      fournisseur_id: null,
      action: "CREATE",
      entite: "clients",
      entite_id: client.id,
      ancienne_valeur: null,
      nouvelle_valeur: JSON.stringify(client),
      adresse_ip: null,
      user_agent: null
    });

    return client;
  },

  async update(
    id: string,
    data: Partial<Client>,
    managerId: string,
  ): Promise<Client> {
    const oldClient = await clientModel.findById(id);
    if (!oldClient) throw new Error("Client non trouvé");

    const client = await clientModel.update(id, data);

    await auditModel.create({
      manager_id: managerId,
      client_id: id,
      fournisseur_id: null,
      action: "UPDATE",
      entite: "clients",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldClient),
      nouvelle_valeur: JSON.stringify(client),
      adresse_ip: null,
      user_agent: null
    });

    return client;
  },

  async delete(id: string, managerId: string): Promise<void> {
    const oldClient = await clientModel.findById(id);
    if (!oldClient) throw new Error("Client non trouvé");

    await clientModel.delete(id);

    await auditModel.create({
      manager_id: managerId,
      client_id: id,
      fournisseur_id: null,
      action: "DELETE",
      entite: "clients",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldClient),
      nouvelle_valeur: null,
      adresse_ip: null,
      user_agent: null
    });
  },

  async search(query: string): Promise<Client[]> {
    return clientModel.search(query);
  },

  async getSolde(id: string): Promise<number> {
    return clientModel.getSolde(id);
  },
};
