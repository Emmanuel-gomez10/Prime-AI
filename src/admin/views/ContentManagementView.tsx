import React, { useState } from "react";
import { BookOpen, FileText, Plus, Search, Trash2, Edit, GraduationCap, Folder } from "lucide-react";
import { toast } from "sonner";

interface ResourceItem {
  id: string;
  title: string;
  category: "Past Question" | "Course Material" | "Study Guide";
  university: string;
  downloads: number;
  uploadedAt: string;
}

const mockResources: ResourceItem[] = [
  { id: "res_1", title: "MTH 201 Linear Algebra Past Questions (2020-2025)", category: "Past Question", university: "University of Lagos", downloads: 1420, uploadedAt: "2026-07-20" },
  { id: "res_2", title: "CHM 101 General Chemistry Comprehensive Notes", category: "Course Material", university: "University of Ibadan", downloads: 890, uploadedAt: "2026-07-25" },
  { id: "res_3", title: "CSC 301 Data Structures & Algorithms Summary", category: "Study Guide", university: "Stanford University", downloads: 2150, uploadedAt: "2026-08-02" },
];

export const ContentManagementView: React.FC = () => {
  const [resources, setResources] = useState<ResourceItem[]>(mockResources);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"Past Question" | "Course Material" | "Study Guide">("Past Question");
  const [newUniversity, setNewUniversity] = useState("University of Lagos");
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item: ResourceItem = {
      id: `res_${Date.now()}`,
      title: newTitle,
      category: newCategory,
      university: newUniversity,
      downloads: 0,
      uploadedAt: new Date().toISOString().split("T")[0]
    };
    setResources([item, ...resources]);
    setNewTitle("");
    setShowAddModal(false);
    toast.success("Study resource added successfully!");
  };

  const handleDelete = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
    toast.success("Resource deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Content & Past Questions Management</h1>
          <p className="text-gray-400 text-xs mt-1">Manage exam papers, university courses, uploaded syllabus guides, and past question archives.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#41E5FF] text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Resource</span>
        </button>
      </div>

      {/* Add Modal */}
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
                  className="w-1/2 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#41E5FF] text-white font-semibold"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
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
            {resources.map((res) => (
              <tr key={res.id} className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-4 font-semibold text-white">{res.title}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30">
                    {res.category}
                  </span>
                </td>
                <td className="py-3.5 px-4">{res.university}</td>
                <td className="py-3.5 px-4 font-mono text-gray-400">{res.downloads} downloads</td>
                <td className="py-3.5 px-4 text-gray-400">{res.uploadedAt}</td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleDelete(res.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

