import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import AssetDetails from './AssetDetails';

interface AssetDetailsModalProps {
  open: boolean;
  assetId: string | null;
  onClose: () => void;
}

const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({ open, assetId, onClose }) => {
  if (!assetId) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '60vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Asset Details
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <AssetDetails assetId={assetId} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default AssetDetailsModal;
