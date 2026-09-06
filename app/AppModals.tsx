'use client';

import React from 'react';
import { SaleReceipt, User, Quotation, PaymentMethod } from '@/types';
import { CompanyInfo, storage } from '@/services/storage';

import { ReceiptModal } from '@/components/ReceiptModal';
import { QuotationModal } from '@/components/QuotationModal';
import { AuthModal } from '@/components/AuthModal';
import { SettingsModal } from '@/components/SettingsModal';

export interface AppModalsProps {
  previewReceipt: SaleReceipt | null;
  setPreviewReceipt: (receipt: SaleReceipt | null) => void;
  previewQuotation: Quotation | null;
  setPreviewQuotation: (quotation: Quotation | null) => void;
  activeUser: User;
  company: CompanyInfo;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (isOpen: boolean) => void;
  onUserChanged?: (user: User) => void;
  onCompanyUpdated?: (info: CompanyInfo) => void;
  onConvertToReceipt?: (quotation: Quotation, paymentMethod: PaymentMethod) => void;
}

export function AppModals({
  previewReceipt,
  setPreviewReceipt,
  previewQuotation,
  setPreviewQuotation,
  activeUser,
  company,
  isAuthModalOpen,
  setIsAuthModalOpen,
  isSettingsModalOpen,
  setIsSettingsModalOpen,
  onUserChanged = () => {},
  onCompanyUpdated = () => {},
  onConvertToReceipt
}: AppModalsProps) {
  return (
    <>
      <ReceiptModal
        receipt={previewReceipt}
        company={company}
        onClose={() => setPreviewReceipt(null)}
      />

      <QuotationModal
        quotation={previewQuotation}
        company={company}
        onClose={() => setPreviewQuotation(null)}
        onConvertToReceipt={onConvertToReceipt}
        onUpdateStatus={(id, status) => {
          storage.updateQuotationStatus(id, status);
          if (previewQuotation && previewQuotation.id === id) {
            setPreviewQuotation({ ...previewQuotation, status });
          }
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        activeUser={activeUser}
        onUserChanged={(user) => {
          storage.setActiveUser(user);
          onUserChanged(user);
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        company={company}
        onCompanyUpdated={(info) => {
          storage.saveCompanyInfo(info);
          onCompanyUpdated(info);
        }}
      />
    </>
  );
}
