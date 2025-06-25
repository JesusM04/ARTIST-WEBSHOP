'use client';

import { ProfileLayout } from "@/components/layouts/profile-layout";
import PerfilForm from "@/components/perfil/perfil-form";

export default function SettingsPage() {
  return (
    <ProfileLayout role="client">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Configuración de Perfil</h1>
        </div>
        <PerfilForm />
      </div>
    </ProfileLayout>
  );
} 