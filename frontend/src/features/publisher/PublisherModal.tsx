'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Person, NavigationDestination } from '@/types/navigation';
import { X, Send, Eye, Code, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PublisherModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  currentAuthorId: string;
  onNavigate: (destination: NavigationDestination) => void;
}

export const PublisherModal: React.FC<PublisherModalProps> = ({
  isOpen,
  onClose,
  people,
  currentAuthorId,
  onNavigate,
}) => {
  const queryClient = useQueryClient();
  const [address, setAddress] = useState('');
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState(currentAuthorId);
  const [html, setHtml] = useState(`
<div style="font-family: sans-serif; padding: 20px;">
  <h1 style="color: #0284c7;">My New Web Page</h1>
  <p>Published on the Wyxan network!</p>
  <hr style="margin: 20px 0; border: 0; border-top: 1px solid #e2e8f0;" />
  <p>Explore other sites: <a href="tidepool.zz">Return to Tidepool</a></p>
</div>
`.trim());
  const [tab, setTab] = useState<'editor' | 'preview'>('editor');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const publishMutation = useMutation({
    mutationFn: () =>
      apiClient.publishSite({
        address,
        title,
        html,
        authorId: authorId || people[0]?._id,
      }),
    onSuccess: (newSite) => {
      queryClient.invalidateQueries({ queryKey: ['siteContent', newSite.address] });
      onClose();
      onNavigate({ type: 'site', address: newSite.address });
    },
    onError: (err: Error) => {
      setErrorMsg(err.message);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!address.trim() || !title.trim() || !html.trim()) {
      setErrorMsg('Please fill out all fields.');
      return;
    }
    publishMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-white font-medium text-sm">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Publish New .zz Web Page</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Canonical Address (.zz)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. marine-biology.zz"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Publishing Author
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {people.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Page Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Ocean Marine Biology Report"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Editor / Preview Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300">
                HTML Content & Markup
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setTab('editor')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                    tab === 'editor' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setTab('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                    tab === 'preview' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
              </div>
            </div>

            {tab === 'editor' ? (
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                rows={9}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            ) : (
              <div className="w-full h-48 bg-white text-slate-900 border border-slate-700 rounded-xl p-4 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-1.5">
              Defense-in-depth: All &lt;script&gt; tags, inline event handlers, and unsafe URLs will be automatically stripped upon publishing.
            </p>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={publishMutation.isPending}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium px-5 py-2 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              {publishMutation.isPending ? 'Publishing...' : 'Publish Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
