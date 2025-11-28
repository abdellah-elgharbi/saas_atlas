/**
 * Script de migration des données du localStorage vers Supabase
 * À exécuter UNE SEULE FOIS pour importer les données initiales
 * 
 * Usage: Exécutez this dans la console du navigateur ou via un bouton admin
 */

import { supabaseService } from '@/services/supabaseService';
import { storageService } from '@/services/storage';
import { Agency, Contact } from '@/types';

export async function migrateDataToSupabase() {
  try {
    console.log('🚀 Démarrage de la migration des données vers Supabase...');

    // 1. Récupérer les données du localStorage
    console.log('📥 Récupération des données du localStorage...');
    const agencies = await storageService.getAgencies();
    const contactsRes = await storageService.getContacts(1, 1000);
    const contacts = contactsRes.data;

    console.log(`✅ Trouvé ${agencies.length} agences`);
    console.log(`✅ Trouvé ${contacts.length} contacts`);

    // 2. Importer les agences
    console.log('📤 Import des agences vers Supabase...');
    let importedAgencies = 0;
    for (const agency of agencies) {
      const { id, created_at, updated_at, ...agencyData } = agency;
      await supabaseService.createAgency(agencyData as any);
      importedAgencies++;
    }
    console.log(`✅ ${importedAgencies} agences importées`);

    // 3. Importer les contacts
    console.log('📤 Import des contacts vers Supabase...');
    let importedContacts = 0;
    for (const contact of contacts) {
      const { id, created_at, updated_at, ...contactData } = contact;
      await supabaseService.createContact(contactData as any);
      importedContacts++;
    }
    console.log(`✅ ${importedContacts} contacts importés`);

    console.log('✅ Migration terminée avec succès!');
    console.log(`📊 Résumé: ${importedAgencies} agences + ${importedContacts} contacts`);

    return {
      success: true,
      agenciesImported: importedAgencies,
      contactsImported: importedContacts,
    };
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

// Fonction utilitaire pour ajouter un bouton de migration au DOM
export function addMigrationButton() {
  const button = document.createElement('button');
  button.innerText = '🔄 Migrer vers Supabase';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    z-index: 9999;
  `;

  button.onclick = async () => {
    button.disabled = true;
    button.innerText = '⏳ Migration en cours...';
    const result = await migrateDataToSupabase();
    if (result.success) {
      button.innerText = '✅ Migration réussie!';
      button.style.backgroundColor = '#28a745';
    } else {
      button.innerText = '❌ Erreur de migration';
      button.style.backgroundColor = '#dc3545';
    }
  };

  document.body.appendChild(button);
}
