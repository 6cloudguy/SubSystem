'use client';

import React, { useState } from 'react';
import { Subscription } from '@/lib/types';
import { useApp } from '@/lib/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface PauseModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PauseSubscriptionModal({ subscription, isOpen, onClose }: PauseModalProps) {
  const { pauseSubscription } = useApp();
  const [reason, setReason] = useState('');
  const [expectedResumeDate, setExpectedResumeDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!subscription) return null;

  const handlePause = async () => {
    setIsLoading(true);
    await pauseSubscription(subscription.id, reason, expectedResumeDate || undefined);
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={`Pause Subscription: ${subscription.subscriptionNumber}`}
      description="Halts recurring billing cycles and marks subscription as PAUSED in PostgreSQL."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handlePause} isLoading={isLoading}>
            Confirm Pause
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Pause Reason"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Budget pause, restructuring, customer request"
        />
        <Input
          label="Expected Resume Date (Optional)"
          type="date"
          value={expectedResumeDate}
          onChange={(e) => setExpectedResumeDate(e.target.value)}
        />
      </div>
    </Modal>
  );
}

interface RenewModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RenewSubscriptionModal({ subscription, isOpen, onClose }: RenewModalProps) {
  const { renewSubscription } = useApp();
  const [newEndDate, setNewEndDate] = useState(
    new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
  );
  const [note, setNote] = useState('Annual contract renewal agreed.');
  const [isLoading, setIsLoading] = useState(false);

  if (!subscription) return null;

  const handleRenew = async () => {
    setIsLoading(true);
    await renewSubscription(subscription.id, newEndDate, note);
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={`Renew Subscription: ${subscription.subscriptionNumber}`}
      description="Extends the contract term and updates next billing dates without duplicating invoices."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleRenew} isLoading={isLoading}>
            Confirm Renewal
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="New Term End Date"
          type="date"
          required
          value={newEndDate}
          onChange={(e) => setNewEndDate(e.target.value)}
        />
        <Input
          label="Renewal Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </Modal>
  );
}

interface CloseModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CloseSubscriptionModal({ subscription, isOpen, onClose }: CloseModalProps) {
  const { closeSubscription } = useApp();
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!subscription) return null;

  const handleClose = async () => {
    setIsLoading(true);
    await closeSubscription(subscription.id, reason);
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={`Close Subscription: ${subscription.subscriptionNumber}`}
      description="Permanently closes subscription lifecycle. Historical invoices and payments remain preserved."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleClose} isLoading={isLoading}>
            Close Subscription
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Termination Reason"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Migration complete, non-renewal, client cancellation"
        />
      </div>
    </Modal>
  );
}
