import React, { useState, useEffect } from "react";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "../../services/admin/adminService";
import type { StudyResourceRecord } from "../../services/admin/adminService";

export const ContentManagementView: React.FC = () => {
  const [resources, setResources] = useState<StudyResourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"Past Question" | "Course Material" | "Study Guide">("Past Question");
  const [newUniversity, setNewUniversity] = useState("University of Lagos");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadResources = async () => {
    setLoading(true);
    const data = await adminService.getStudyResources();
    setResources(data);
    setLoading(false);
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    const created = await adminService.createStudyResource({
      title: newTitle,
      category: newCategory,
      university: newUniversity,
      downloads: 0,
    });

    setIsSubmitting(false);

    if (created) {
      setResources([created, ...resources]);
      setNewTitle("");
      setShowAddModal(false);
      toast.success("Study resource added successfully!");
    } else {
      toast.error("Failed to save study resource.");
    }
  };

  const handleDelete = async (id: string) => {
    const success = await adminService.deleteStudyResource(id);
    if (success) {
      setResources((prev) => prev.filter((r) => r.id !== id));
      toast.success("Resource deleted");
    } else {
      toast.error("Failed to delete resource");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Content & Past Questions Management</h1>
          <p className="text-gray-400 text-xs mt-1">Manage exam papers, university courses, uploaded syllabus guides, and past question archives.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadResources}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 border border-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#41E5FF] text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Resource</span>
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121428] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Upload New Past Question / Resource</h3>

            <form onSubmit={handleAddResource} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. PHY 102 Mechanics Past Questions 2025"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Past Question" className="bg-[#121428]">Past Question</option>
                  <option value="Course Material" className="bg-[#121428]">Course Material</option>
                  <option value="Study Guide" className="bg-[#121428]">Study Guide</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">University</label>
                <input
                  type="text"
                  value={newUniversity}
                  onChange={(e) => setNewUniversity(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2 rounded-xl bg-white/[0.05] text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#41E5FF] text-white font-semibold flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Save Resource</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.03] border-b border-white/10 text-gray-400 uppercase text-[10px]">
            <tr>
              <th className="py-3.5 px-4">Title</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">University</th>
              <th className="py-3.5 px-4">Downloads</th>
              <th className="py-3.5 px-4">Date Uploaded</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#41E5FF]" />
                  Loading study resources...
                </td>
              </tr>
            ) : resources.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  No study resources available yet.
                </td>
              </tr>
            ) : (
              resources.map((res) => (
                <tr key={res.id} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 font-semibold text-white">{res.title}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30">
                      {res.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">{res.university}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-400">{res.downloads} downloads</td>
                  <td className="py-3.5 px-4 text-gray-400">
                    {res.uploaded_at ? new Date(res.uploaded_at).toLocaleDateString() : res.created_at ? new Date(res.created_at).toLocaleDateString() : 'Today'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(res.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


