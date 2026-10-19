import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Room, RoomType, NavEdge } from '../../types';
import {
  PencilRuler,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Building,
  GitBranch,
  Save,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export const BuildingEditorPanel: React.FC = () => {
  const {
    building,
    addRoom,
    deleteRoom,
    addEdge,
    resetToDefaultBuilding,
    exportBuildingJson,
    importBuildingJson,
  } = useAppStore();

  // New Room Form state
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState<RoomType>('office');
  const [roomWidth, setRoomWidth] = useState(7);
  const [roomDepth, setRoomDepth] = useState(6);
  const [roomX, setRoomX] = useState(12);
  const [roomZ, setRoomZ] = useState(12);

  // New Edge / Connection state
  const [fromNodeId, setFromNodeId] = useState(building.nodes[0]?.id || '');
  const [toNodeId, setToNodeId] = useState(building.nodes[1]?.id || '');
  const [isDoor, setIsDoor] = useState(true);

  // JSON Import / Export modal state
  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; msg?: string } | null>(null);

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    const newId = `room-${Date.now()}`;
    const newRoom: Room = {
      id: newId,
      name: roomName.trim(),
      type: roomType,
      x: roomX,
      y: 0,
      z: roomZ,
      width: roomWidth,
      depth: roomDepth,
      height: 3.2,
      floor: 1,
      capacity: 10,
      description: `Custom ${roomType} space created via Building Editor.`,
    };

    addRoom(newRoom);
    setRoomName('');
    setRoomX((prev) => prev + 4);
  };

  const handleAddConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromNodeId === toNodeId) return;

    const n1 = building.nodes.find((n) => n.id === fromNodeId);
    const n2 = building.nodes.find((n) => n.id === toNodeId);
    if (!n1 || !n2) return;

    const dx = n1.x - n2.x;
    const dy = n1.y - n2.y;
    const dz = n1.z - n2.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const newEdge: NavEdge = {
      id: `edge-${Date.now()}`,
      fromNodeId,
      toNodeId,
      distance: Number(dist.toFixed(1)),
      isBlocked: false,
      isDoor,
      hazardPenalty: 0,
    };

    addEdge(newEdge);
  };

  const handleExportJson = () => {
    const jsonStr = exportBuildingJson();
    setJsonText(jsonStr);
    navigator.clipboard.writeText(jsonStr);
    setImportStatus({ success: true, msg: 'Configuration copied to clipboard!' });
  };

  const handleImportJson = () => {
    if (!jsonText.trim()) return;
    const res = importBuildingJson(jsonText);
    if (res.success) {
      setImportStatus({ success: true, msg: 'Building floorplan imported successfully!' });
    } else {
      setImportStatus({ success: false, msg: res.error || 'Failed to import JSON.' });
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto overflow-y-auto h-full text-[#172033] select-none">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <PencilRuler className="w-5 h-5 text-blue-600" />
            3D Facility Layout Editor
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Construct rooms, configure passages, establish doors, and manage floorplans
          </p>
        </div>

        <button
          onClick={resetToDefaultBuilding}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#172033] border border-[#E2E8F0] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
          Reset to Sample Layout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Add Room Form */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5 mb-4">
            <Plus className="w-4 h-4 text-blue-600" />
            Create New Room
          </h3>

          <form onSubmit={handleAddRoom} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-[#64748B] block mb-1.5">
                Room Name
              </label>
              <input
                type="text"
                placeholder="e.g., Robotics Lab B, Office 204"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#172033] outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#64748B] block mb-1.5">
                  Room Classification
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as RoomType)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#172033] outline-none focus:border-blue-500"
                >
                  <option value="office">Office</option>
                  <option value="classroom">Classroom</option>
                  <option value="laboratory">Laboratory</option>
                  <option value="storage">Storage</option>
                  <option value="lobby">Lobby</option>
                  <option value="stairwell">Stairwell</option>
                  <option value="corridor">Corridor</option>
                  <option value="exit">Emergency Exit</option>
                  <option value="conference">Conference</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#64748B] block mb-1.5">
                  Floor Level
                </label>
                <input
                  type="number"
                  value={1}
                  disabled
                  className="w-full bg-slate-100 border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#64748B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-[10px] text-[#64748B] block mb-1">Width (m)</label>
                <input
                  type="number"
                  min="3"
                  max="30"
                  value={roomWidth}
                  onChange={(e) => setRoomWidth(parseFloat(e.target.value))}
                  className="w-full bg-white border border-[#E2E8F0] rounded px-2 py-1.5 text-center font-mono text-[#172033]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#64748B] block mb-1">Depth (m)</label>
                <input
                  type="number"
                  min="3"
                  max="30"
                  value={roomDepth}
                  onChange={(e) => setRoomDepth(parseFloat(e.target.value))}
                  className="w-full bg-white border border-[#E2E8F0] rounded px-2 py-1.5 text-center font-mono text-[#172033]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#64748B] block mb-1">Coord X</label>
                <input
                  type="number"
                  value={roomX}
                  onChange={(e) => setRoomX(parseFloat(e.target.value))}
                  className="w-full bg-white border border-[#E2E8F0] rounded px-2 py-1.5 text-center font-mono text-[#172033]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#64748B] block mb-1">Coord Z</label>
                <input
                  type="number"
                  value={roomZ}
                  onChange={(e) => setRoomZ(parseFloat(e.target.value))}
                  className="w-full bg-white border border-[#E2E8F0] rounded px-2 py-1.5 text-center font-mono text-[#172033]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Add Room to Floorplan
            </button>
          </form>
        </div>

        {/* 2. Add Passage / Doorway Connection */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5 mb-4">
            <GitBranch className="w-4 h-4 text-blue-600" />
            Connect Passages & Doorways
          </h3>

          <form onSubmit={handleAddConnection} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-[#64748B] block mb-1.5">
                From Node / Room
              </label>
              <select
                value={fromNodeId}
                onChange={(e) => setFromNodeId(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#172033] outline-none focus:border-blue-500"
              >
                {building.nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#64748B] block mb-1.5">
                To Node / Room
              </label>
              <select
                value={toNodeId}
                onChange={(e) => setToNodeId(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#172033] outline-none focus:border-blue-500"
              >
                {building.nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isDoorCheck"
                checked={isDoor}
                onChange={(e) => setIsDoor(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <label htmlFor="isDoorCheck" className="text-xs text-[#172033]">
                Designate as Physical Doorway / Portal
              </label>
            </div>

            <button
              type="submit"
              disabled={fromNodeId === toNodeId}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                fromNodeId === toNodeId
                  ? 'bg-slate-100 text-[#64748B] cursor-not-allowed border border-[#E2E8F0]'
                  : 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              Establish Connection
            </button>
          </form>
        </div>
      </div>

      {/* 3. Existing Rooms Management Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5 mb-3.5">
          <Building className="w-4 h-4 text-blue-600" />
          Configured Rooms ({building.rooms.length})
        </h3>

        <div className="overflow-x-auto max-h-56 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <th className="py-2.5 px-3">Room Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Size (W×D)</th>
                <th className="py-2.5 px-3">Center (X, Z)</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {building.rooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-[#172033]">{room.name}</td>
                  <td className="py-2.5 px-3 uppercase text-[10px] font-mono text-blue-600 font-bold">
                    {room.type}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#64748B]">
                    {room.width}m × {room.depth}m
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#64748B]">
                    [{room.x}, {room.z}]
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => deleteRoom(room.id)}
                      className="p-1.5 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete room"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. JSON Import & Export */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
            <Save className="w-4 h-4 text-blue-600" />
            JSON Configuration Backup & Restore
          </h3>
          <div className="flex gap-2.5">
            <button
              onClick={handleExportJson}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-blue-600 text-xs font-semibold flex items-center gap-1.5 border border-[#E2E8F0] shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Copy Export JSON
            </button>
            <button
              onClick={handleImportJson}
              className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Apply Import
            </button>
          </div>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-lg text-xs mb-3.5 flex items-center gap-2 ${
              importStatus.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {importStatus.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{importStatus.msg}</span>
          </div>
        )}

        <textarea
          rows={5}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="Paste exported building JSON here to load a customized facility layout..."
          className="w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-xs font-mono text-[#172033] outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
};
