"use client";

import React from "react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  name: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  name
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
        <p className="text-sm mb-6">
          Are you sure you want to delete this service? {name}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
