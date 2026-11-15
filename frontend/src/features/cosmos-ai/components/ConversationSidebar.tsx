import React, { useState } from 'react';
import type { ConversationSummary } from '../types/conversation.types';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  Calendar,
  Search,
  Activity,
  CheckCircle2,
  FileText,
  HelpCircle,
  Sparkles,
  Compass,
} from 'lucide-react';

interface ConversationSidebarProps {
  conversations: ConversationSummary[];
  activeId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onTriggerPrompt?: (prompt: string) => void;
  isOpen: boolean;
  className?: string;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
  onTriggerPrompt,
  isOpen,
  className = '',
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const startRename = (conv: ConversationSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const triggerDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      onDeleteConversation(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  return (
    <>
      <aside
        className={`flex flex-col bg-[#0A1020] border-r border-[#1A2940] transition-all duration-200 z-20 ${
          isOpen ? 'w-72' : 'w-0 hidden md:flex md:w-16'
        } ${className}`}
      >
        {/* Top Header / New Chat */}
        <div className="p-3 border-b border-[#1A2940] flex items-center justify-between">
          {isOpen ? (
            <button
              type="button"
              onClick={onNewConversation}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-[#4388FF] hover:bg-[#5A9BFF] text-[#F4F7FF] rounded-lg text-xs font-medium tracking-wide shadow transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Investigation</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onNewConversation}
              title="New Inquiry"
              className="p-2 mx-auto bg-[#4388FF] hover:bg-[#5A9BFF] text-[#F4F7FF] rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => {
            const isActive = conv.id === activeId;

            if (!isOpen) {
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => onSelectConversation(conv.id)}
                  title={`${conv.title} (${conv.messageCount} msgs)`}
                  className={`w-full p-2.5 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-sky-400 border border-sky-500/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              );
            }

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group relative flex flex-col p-2.5 rounded-lg text-xs cursor-pointer border transition-all ${
                  isActive
                    ? 'bg-[#101A2B] border-[#4388FF]/50 text-[#F4F7FF] shadow-sm shadow-[#4388FF]/10'
                    : 'bg-transparent border-transparent text-[#8293AD] hover:bg-[#101A2B]/60 hover:text-[#F4F7FF]'
                }`}
              >
                <div className="flex items-center justify-between space-x-1.5">
                  <div className="flex items-center space-x-2 truncate flex-1">
                    <MessageSquare
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-[#45D5F2]' : 'text-[#64758F]'
                      }`}
                    />
                    {editingId === conv.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(conv.id, e as unknown as React.MouseEvent);
                          if (e.key === 'Escape') cancelRename(e as unknown as React.MouseEvent);
                        }}
                        autoFocus
                        className="bg-slate-950 border border-sky-600 rounded px-1.5 py-0.5 text-xs text-white w-full outline-none"
                      />
                    ) : (
                      <span className="truncate font-medium">{conv.title}</span>
                    )}
                  </div>

                  {/* Actions (Rename / Delete) */}
                  <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === conv.id ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => saveRename(conv.id, e)}
                          title="Save title"
                          className="p-1 hover:text-emerald-400 text-slate-400"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelRename}
                          title="Cancel"
                          className="p-1 hover:text-rose-400 text-slate-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={(e) => startRename(conv, e)}
                          title="Rename thread"
                          className="p-1 hover:text-sky-400 text-slate-500"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => triggerDelete(conv.id, e)}
                          title="Delete thread"
                          className="p-1 hover:text-rose-400 text-slate-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Subtitle / Timestamp / Messages */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pl-5">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-2.5 h-2.5" />
                    <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                  </span>
                  <span className="font-mono bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                    {conv.messageCount} msg{conv.messageCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Investigation Actions (1-Click Inquiries on Left Side) */}
        {onTriggerPrompt && isOpen && (
          <div className="border-t border-[#1A2940] p-3 space-y-2 bg-[#080d1a] shrink-0">
            <div className="flex items-center justify-between text-[11px] text-[#8293AD] font-semibold uppercase tracking-wider">
              <span className="flex items-center space-x-1.5 text-[#45D5F2]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Investigation Actions</span>
              </span>
              <span className="text-[10px] text-[#45D5F2] font-mono">1-CLICK</span>
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto scrollbar-thin pr-1 text-xs">
              {[
                { label: 'Explain Observation', prompt: 'Explain the observational properties, wavelength coverage, and detector characteristics of this observation.', icon: Search },
                { label: 'Compare Epochs', prompt: 'Compare the selected temporal epochs and evaluate whether the detected change is consistent with a point-source transient.', icon: Activity },
                { label: 'Explain Compatibility', prompt: 'Explain the scientific compatibility between these epochs, detailing passband overlap, PSF ratio, and difference imaging validity.', icon: CheckCircle2 },
                { label: 'Summarise Evidence', prompt: 'Provide a complete 7-part scientific evidence breakdown of all photometric, astrometric, and contextual evidence available.', icon: FileText },
                { label: 'Review Quality Flags', prompt: 'Review all detector and calibration quality flags associated with this candidate and identify potential instrumental caveats.', icon: AlertCircle },
                { label: 'Missing Metadata', prompt: 'What critical observational metadata, follow-up spectroscopy, or archival observations are currently missing to verify this source?', icon: HelpCircle },
                { label: 'Physical Hypotheses', prompt: 'Evaluate the 6 qualitative explanation categories (astrophysical, instrumental, calibration, background, astrometric, insufficient evidence).', icon: Sparkles },
                { label: 'Report Narrative', prompt: 'Synthesize a formal scientific report narrative suitable for inclusion in an astronomical investigation dossier.', icon: Compass },
              ].map((act, idx) => {
                const Icon = act.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onTriggerPrompt(act.prompt)}
                    className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-[#101A2B] hover:bg-[#1a2942] border border-[#1A2940] hover:border-[#4388FF]/50 text-slate-300 hover:text-white transition-all text-left text-[11px] cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#45D5F2] shrink-0" />
                    <span className="truncate">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Collapsed Icon-only Quick Actions */}
        {onTriggerPrompt && !isOpen && (
          <div className="border-t border-[#1A2940] p-2 space-y-1.5 bg-[#080d1a] shrink-0 flex flex-col items-center">
            {[
              { label: 'Explain Observation', prompt: 'Explain the observational properties, wavelength coverage, and detector characteristics of this observation.', icon: Search },
              { label: 'Compare Epochs', prompt: 'Compare the selected temporal epochs and evaluate whether the detected change is consistent with a point-source transient.', icon: Activity },
              { label: 'Summarise Evidence', prompt: 'Provide a complete 7-part scientific evidence breakdown of all photometric, astrometric, and contextual evidence available.', icon: FileText },
              { label: 'Physical Hypotheses', prompt: 'Evaluate the 6 qualitative explanation categories (astrophysical, instrumental, calibration, background, astrometric, insufficient evidence).', icon: Sparkles },
            ].map((act, idx) => {
              const Icon = act.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  title={act.label}
                  onClick={() => onTriggerPrompt(act.prompt)}
                  className="p-2 rounded-lg bg-[#101A2B] hover:bg-[#1a2942] border border-[#1A2940] hover:border-[#4388FF]/50 text-[#45D5F2] transition-all cursor-pointer"
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        )}
      </aside>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-4 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-semibold text-slate-100">Delete Conversation</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this astronomical conversation? All discussion records and context reasoning steps will be removed from local storage.
            </p>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-3 py-1.5 rounded text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                Delete Thread
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
