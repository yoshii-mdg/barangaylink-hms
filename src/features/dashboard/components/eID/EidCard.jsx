import React, { useState } from 'react';
import { BsQrCode } from 'react-icons/bs';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { TbUserOff } from 'react-icons/tb';
import { EIdProfile } from '.'

export default function EidCard({ eid, onEdit, onDeactivate, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (!eid) return null;

  const { idNumber, name, address } = eid;

  return (
    <article className="relative bg-white rounded-sm border border-gray-200 border-b-6 border-b-[#0F8A1C] shadow-sm px-4 py-4 flex items-center justify-center w-full min-h-[160px] sm:min-h-[200px] lg:min-h-[250px]">
      <button
        type="button"
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        aria-label="More actions"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <HiOutlineDotsHorizontal className="w-5 h-5" />
      </button>

      {menuOpen && (
        <div className="absolute top-10 right-3 z-20 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-2">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
            onClick={() => {
              onEdit?.(eid);
              setMenuOpen(false);
            }}
          >
            <FiEdit2 className="w-4 h-4" />
            <span>Edit Details</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
            onClick={() => {
              onDeactivate?.(eid);
              setMenuOpen(false);
            }}
          >
            <TbUserOff className="w-4 h-4" />
            <span>Deactivate eID</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              onDelete?.(eid);
              setMenuOpen(false);
            }}
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Delete eID</span>
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 pl-3  sm:pl-8 lg:pl-10 w-full pr-10">
        <div className="shrink-0">
          <EIdProfile name={name} className='!w-[60px] !h-[60px] sm:!w-[90px] sm:!h-[90px]' />
        </div>


        <div className="flex-1 space-y-1 min-w-0">
          <p className="text-sm sm:text-base text-gray-800 truncate">
            <span className="font-semibold">ID:</span>{' '}
            <span>{idNumber}</span>
          </p>
          <p className="text-sm sm:text-base text-gray-800 truncate">
            <span className="font-semibold">Name:</span>{' '}
            <span>{name}</span>
          </p>
          <p className="text-sm sm:text-base text-gray-800 truncate">
            <span className="font-semibold">Address:</span>{' '}
            <span>{address}</span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-3 right-3">
        <BsQrCode className="w-7 h-7 sm:w-10 sm:h-10 text-black" />
      </div>
    </article>
  );
}


