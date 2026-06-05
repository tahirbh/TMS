/**
 * UML Use Case Diagrams — TMS Pro
 * Proper UML notation: stick-figure actors, oval use cases, system boundary,
 * solid association lines, dashed «include»/«extend» with open arrow,
 * hollow-triangle generalization. Matches standard UML spec (as in sample image).
 */

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pt { x: number; y: number }

interface ActorDef {
  id: string;
  name: string;   // newline chars supported
  x: number;
  y: number;
}

interface UCDef {
  id: string;
  lines: string[];
  x: number;
  y: number;
  rx?: number;
  ry?: number;
}

type RelKind = 'association' | 'include' | 'extend' | 'generalization';

interface RelDef {
  from: string;
  to: string;
  kind: RelKind;
  fromMult?: string;
  toMult?: string;
}

interface Boundary {
  x: number; y: number; w: number; h: number;
  stereotype?: string;
  name: string;
}

interface UMLDiagram {
  id: string;
  menuLabel: string;
  title: string;
  color: string;
  boundary: Boundary;
  actors: ActorDef[];
  usecases: UCDef[];
  rels: RelDef[];
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

const ellipseEdge = (uc: UCDef, toward: Pt): Pt => {
  const rx = uc.rx ?? 78, ry = uc.ry ?? 28;
  const a = Math.atan2(toward.y - uc.y, toward.x - uc.x);
  return { x: uc.x + rx * Math.cos(a), y: uc.y + ry * Math.sin(a) };
};

const actorEdge = (ac: ActorDef, toward: Pt): Pt => {
  const cx = ac.x, cy = ac.y + 30;
  const dx = toward.x - cx, dy = toward.y - cy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: cx + (dx / len) * 30, y: cy + (dy / len) * 30 };
};

// ─── SVG sub-components ───────────────────────────────────────────────────────

function Defs() {
  return (
    <defs>
      {/* Open arrowhead — used for «include» and «extend» */}
      <marker id="uml-open" markerWidth="11" markerHeight="9"
              refX="10" refY="4.5" orient="auto" markerUnits="strokeWidth">
        <polyline points="0,0.5 10,4.5 0,8.5"
                  fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round"/>
      </marker>
      {/* Hollow triangle — used for generalization */}
      <marker id="uml-gen" markerWidth="13" markerHeight="11"
              refX="12" refY="5.5" orient="auto" markerUnits="strokeWidth">
        <polygon points="0,0 11,5.5 0,11" fill="white" stroke="#1e293b" strokeWidth="1.5"/>
      </marker>
    </defs>
  );
}

function Actor({ a }: { a: ActorDef }) {
  const { x, y, name } = a;
  const parts = name.split('\n');
  return (
    <g>
      {/* Head */}
      <circle cx={x} cy={y} r={14} fill="white" stroke="#1e293b" strokeWidth={1.5} />
      {/* Body */}
      <line x1={x} y1={y + 14} x2={x} y2={y + 44} stroke="#1e293b" strokeWidth={1.5} />
      {/* Arms */}
      <line x1={x - 20} y1={y + 27} x2={x + 20} y2={y + 27} stroke="#1e293b" strokeWidth={1.5} />
      {/* Left leg */}
      <line x1={x} y1={y + 44} x2={x - 15} y2={y + 64} stroke="#1e293b" strokeWidth={1.5} />
      {/* Right leg */}
      <line x1={x} y1={y + 44} x2={x + 15} y2={y + 64} stroke="#1e293b" strokeWidth={1.5} />
      {/* Name label */}
      {parts.map((part, i) => (
        <text key={i} x={x} y={y + 80 + i * 13}
              textAnchor="middle" fontSize={11} fontWeight="700" fill="#0f172a"
              fontFamily="Inter, system-ui, sans-serif">
          {part}
        </text>
      ))}
    </g>
  );
}

function UseCase({ uc }: { uc: UCDef }) {
  const rx = uc.rx ?? 78, ry = uc.ry ?? 28;
  const lh = 13.5;
  const baseY = uc.y - ((uc.lines.length - 1) * lh) / 2;
  return (
    <g>
      <ellipse cx={uc.x} cy={uc.y} rx={rx} ry={ry}
               fill="white" stroke="#1e293b" strokeWidth={1.5} />
      {uc.lines.map((line, i) => (
        <text key={i} x={uc.x} y={baseY + i * lh}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={10.5} fontWeight="600" fill="#0f172a"
              fontFamily="Inter, system-ui, sans-serif">
          {line}
        </text>
      ))}
    </g>
  );
}

function BoundaryRect({ b }: { b: Boundary }) {
  const stereoY = b.y + 16;
  const nameY   = b.stereotype ? b.y + 31 : b.y + 20;
  return (
    <g>
      <rect x={b.x} y={b.y} width={b.w} height={b.h}
            fill="none" stroke="#1e293b" strokeWidth={2} rx={3} />
      {b.stereotype && (
        <text x={b.x + b.w / 2} y={stereoY}
              textAnchor="middle" fontSize={9.5} fontStyle="italic" fill="#64748b"
              fontFamily="Inter, system-ui, sans-serif">
          «{b.stereotype}»
        </text>
      )}
      <text x={b.x + b.w / 2} y={nameY}
            textAnchor="middle" fontSize={13} fontWeight="700" fill="#0f172a"
            fontFamily="Inter, system-ui, sans-serif">
        {b.name}
      </text>
    </g>
  );
}

function Relation({ rel, aMap, uMap }: {
  rel: RelDef;
  aMap: Map<string, ActorDef>;
  uMap: Map<string, UCDef>;
}) {
  const fa = aMap.get(rel.from), fu = uMap.get(rel.from);
  const ta = aMap.get(rel.to),   tu = uMap.get(rel.to);
  if ((!fa && !fu) || (!ta && !tu)) return null;

  const fromC: Pt = fu ? { x: fu.x, y: fu.y } : { x: fa!.x, y: fa!.y + 30 };
  const toC: Pt   = tu ? { x: tu.x, y: tu.y } : { x: ta!.x, y: ta!.y + 30 };

  const p1: Pt = fu ? ellipseEdge(fu, toC)  : actorEdge(fa!, toC);
  const p2: Pt = tu ? ellipseEdge(tu, fromC) : actorEdge(ta!, fromC);

  const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const px = (-dy / len) * 9, py = (dx / len) * 9;   // perp offset for label

  const isDashed  = rel.kind === 'include' || rel.kind === 'extend';
  const markerId  = rel.kind === 'generalization' ? 'uml-gen' :
                    rel.kind !== 'association'     ? 'uml-open' : undefined;
  const labelText = rel.kind === 'include' ? '«include»' :
                    rel.kind === 'extend'  ? '«extend»'  : undefined;

  return (
    <g>
      <line
        x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
        stroke="#1e293b" strokeWidth={1.5}
        strokeDasharray={isDashed ? '6,4' : undefined}
        markerEnd={markerId ? `url(#${markerId})` : undefined}
      />
      {labelText && (
        <text x={mx + px} y={my + py}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={9} fontStyle="italic" fill="#475569"
              fontFamily="Inter, system-ui, sans-serif">
          {labelText}
        </text>
      )}
      {rel.fromMult && (
        <text x={p1.x + (dx > 0 ? 7 : -7)} y={p1.y - 5}
              fontSize={9} fill="#64748b"
              textAnchor={dx > 0 ? 'start' : 'end'}
              fontFamily="Inter, system-ui, sans-serif">
          {rel.fromMult}
        </text>
      )}
      {rel.toMult && (
        <text x={p2.x + (dx > 0 ? -7 : 7)} y={p2.y - 5}
              fontSize={9} fill="#64748b"
              textAnchor={dx > 0 ? 'end' : 'start'}
              fontFamily="Inter, system-ui, sans-serif">
          {rel.toMult}
        </text>
      )}
    </g>
  );
}

function DiagramSVG({ diagram }: { diagram: UMLDiagram }) {
  const aMap = new Map(diagram.actors.map(a => [a.id, a]));
  const uMap = new Map(diagram.usecases.map(u => [u.id, u]));
  return (
    <svg viewBox="0 0 900 590" xmlns="http://www.w3.org/2000/svg"
         style={{ width: '100%', height: '100%', background: 'white', display: 'block' }}>
      <Defs />
      {/* 1 — System boundary (drawn first, at bottom) */}
      <BoundaryRect b={diagram.boundary} />
      {/* 2 — Relations */}
      {diagram.rels.map((r, i) => (
        <Relation key={i} rel={r} aMap={aMap} uMap={uMap} />
      ))}
      {/* 3 — Use cases (on top of lines) */}
      {diagram.usecases.map(uc => <UseCase key={uc.id} uc={uc} />)}
      {/* 4 — Actors (on top of everything) */}
      {diagram.actors.map(a => <Actor key={a.id} a={a} />)}
    </svg>
  );
}

// ─── Diagram Data — all 8 modules ─────────────────────────────────────────────
// Boundary: x=165 y=38 w=588 h=535  →  right edge x=753, bottom y=573
// Left actors: x=80   Right actors: x=845

const DIAGRAMS: UMLDiagram[] = [

  // ── 1. Operations ────────────────────────────────────────────────────────────
  {
    id: 'operations', menuLabel: 'Operations',
    title: 'Dashboard · Control Tower · Orders · Dispatch · Trips',
    color: '#3b82f6',
    boundary: { x: 165, y: 38, w: 588, h: 535, stereotype: 'Module', name: 'TMS Pro :: Operations' },
    actors: [
      { id: 'admin',      name: 'Admin',      x: 82,  y: 108 },
      { id: 'dispatcher', name: 'Dispatcher', x: 82,  y: 310 },
      { id: 'driver',     name: 'Driver',     x: 842, y: 270 },
    ],
    usecases: [
      { id: 'dashboard',     lines: ['View', 'Dashboard'],           x: 300, y: 145 },
      { id: 'ctrl-tower',    lines: ['Monitor', 'Control Tower'],    x: 510, y: 145 },
      { id: 'orders',        lines: ['Manage', 'Orders'],            x: 300, y: 263 },
      { id: 'dispatch',      lines: ['Dispatch', 'Trip'],            x: 488, y: 263 },
      { id: 'assign-res',    lines: ['Assign Vehicle', '& Driver'],  x: 655, y: 208, rx: 82 },
      { id: 'start-trip',    lines: ['Start', 'Trip'],               x: 332, y: 390 },
      { id: 'rpt-arrival',   lines: ['Report', 'Arrival'],           x: 524, y: 390 },
      { id: 'upload-pod',    lines: ['Upload POD', '/ Bayan'],       x: 658, y: 450, rx: 76 },
      { id: 'complete-trip', lines: ['Complete', 'Trip'],            x: 415, y: 500 },
      { id: 'auto-ledger',   lines: ['Auto-Calculate', 'Ledger'],   x: 626, y: 516, rx: 80 },
    ],
    rels: [
      { from: 'admin',      to: 'dashboard',     kind: 'association', fromMult: '1', toMult: '1' },
      { from: 'admin',      to: 'ctrl-tower',    kind: 'association' },
      { from: 'admin',      to: 'orders',        kind: 'association' },
      { from: 'dispatcher', to: 'orders',        kind: 'association' },
      { from: 'dispatcher', to: 'dispatch',      kind: 'association', fromMult: '1', toMult: '1..*' },
      { from: 'dispatch',   to: 'assign-res',    kind: 'include' },
      { from: 'driver',     to: 'start-trip',    kind: 'association', fromMult: '1..*', toMult: '1' },
      { from: 'driver',     to: 'rpt-arrival',   kind: 'association' },
      { from: 'driver',     to: 'complete-trip', kind: 'association' },
      { from: 'upload-pod', to: 'rpt-arrival',   kind: 'extend' },
      { from: 'complete-trip', to: 'auto-ledger',kind: 'include' },
      { from: 'admin',      to: 'dispatcher',    kind: 'generalization' },
    ],
  },

  // ── 2. Fleet & Assets ────────────────────────────────────────────────────────
  {
    id: 'fleet', menuLabel: 'Fleet & Assets',
    title: 'Vehicles · Trailers · Fleet Combinations · Breakdowns',
    color: '#8b5cf6',
    boundary: { x: 165, y: 38, w: 588, h: 535, stereotype: 'Module', name: 'TMS Pro :: Fleet & Assets' },
    actors: [
      { id: 'admin',      name: 'Admin',      x: 82, y: 125 },
      { id: 'dispatcher', name: 'Dispatcher', x: 82, y: 348 },
    ],
    usecases: [
      { id: 'reg-vehicle',   lines: ['Register', 'Vehicle'],             x: 296, y: 148 },
      { id: 'import-csv',    lines: ['Import Fleet', 'via CSV'],         x: 510, y: 148, rx: 76 },
      { id: 'compliance',    lines: ['Check Compliance', 'Dates'],       x: 296, y: 272, rx: 82 },
      { id: 'expiry-alerts', lines: ['View Expiry', 'Alerts'],           x: 538, y: 228, rx: 78 },
      { id: 'trailers',      lines: ['Manage', 'Trailers'],              x: 296, y: 388 },
      { id: 'fleet-combo',   lines: ['Create Fleet', 'Combination'],     x: 518, y: 342, rx: 80 },
      { id: 'breakdown',     lines: ['Report', 'Breakdown'],             x: 296, y: 498 },
      { id: 'upd-status',    lines: ['Update Vehicle', 'Status'],        x: 514, y: 455, rx: 80 },
    ],
    rels: [
      { from: 'admin',      to: 'reg-vehicle',   kind: 'association' },
      { from: 'admin',      to: 'import-csv',    kind: 'association' },
      { from: 'admin',      to: 'compliance',    kind: 'association', fromMult: '1', toMult: '1..*' },
      { from: 'dispatcher', to: 'compliance',    kind: 'association' },
      { from: 'compliance', to: 'expiry-alerts', kind: 'include' },
      { from: 'admin',      to: 'trailers',      kind: 'association' },
      { from: 'dispatcher', to: 'trailers',      kind: 'association' },
      { from: 'admin',      to: 'fleet-combo',   kind: 'association' },
      { from: 'dispatcher', to: 'fleet-combo',   kind: 'association' },
      { from: 'dispatcher', to: 'breakdown',     kind: 'association' },
      { from: 'breakdown',  to: 'upd-status',    kind: 'include' },
      { from: 'admin',      to: 'dispatcher',    kind: 'generalization' },
    ],
  },

  // ── 3. Workforce ─────────────────────────────────────────────────────────────
  {
    id: 'workforce', menuLabel: 'Workforce',
    title: 'Employee Master · Drivers · Labor · Mobilization · Supervisors · Sponsors',
    color: '#10b981',
    boundary: { x: 165, y: 38, w: 588, h: 535, stereotype: 'Module', name: 'TMS Pro :: Workforce' },
    actors: [
      { id: 'admin',      name: 'Admin',      x: 82,  y: 110 },
      { id: 'supervisor', name: 'Supervisor', x: 82,  y: 340 },
      { id: 'driver',     name: 'Driver',     x: 842, y: 418 },
    ],
    usecases: [
      { id: 'add-emp',       lines: ['Add', 'Employee'],          x: 296, y: 145 },
      { id: 'asn-sponsor',   lines: ['Assign to', 'Sponsor'],     x: 500, y: 145 },
      { id: 'asn-site',      lines: ['Assign to', 'Site'],        x: 296, y: 268 },
      { id: 'mobilize',      lines: ['Manage', 'Mobilization'],   x: 500, y: 268 },
      { id: 'transfer',      lines: ['Transfer', 'Employee'],     x: 658, y: 228, rx: 76 },
      { id: 'labor',         lines: ['Monitor', 'Labor'],         x: 296, y: 388 },
      { id: 'gov-lookup',    lines: ['Gov Data', 'Lookup'],       x: 296, y: 498 },
      { id: 'face-enroll',   lines: ['Enroll', 'Face ID'],        x: 508, y: 388 },
      { id: 'drivers-mgmt',  lines: ['View', 'Drivers'],          x: 508, y: 498 },
    ],
    rels: [
      { from: 'admin',      to: 'add-emp',      kind: 'association', fromMult: '1', toMult: '1..*' },
      { from: 'admin',      to: 'asn-sponsor',  kind: 'association' },
      { from: 'admin',      to: 'asn-site',     kind: 'association' },
      { from: 'admin',      to: 'mobilize',     kind: 'association' },
      { from: 'supervisor', to: 'mobilize',     kind: 'association' },
      { from: 'mobilize',   to: 'transfer',     kind: 'include' },
      { from: 'supervisor', to: 'labor',        kind: 'association' },
      { from: 'admin',      to: 'gov-lookup',   kind: 'association' },
      { from: 'admin',      to: 'face-enroll',  kind: 'association' },
      { from: 'driver',     to: 'face-enroll',  kind: 'association' },
      { from: 'gov-lookup', to: 'face-enroll',  kind: 'extend' },
      { from: 'admin',      to: 'drivers-mgmt', kind: 'association' },
      { from: 'admin',      to: 'supervisor',   kind: 'generalization' },
    ],
  },

  // ── 4. Logistics & DMS ───────────────────────────────────────────────────────
  {
    id: 'logistics', menuLabel: 'Logistics & DMS',
    title: 'DMS Engine · Relational Search · Sites · Gov Data Lookup',
    color: '#0ea5e9',
    boundary: { x: 165, y: 38, w: 588, h: 535, stereotype: 'Module', name: 'TMS Pro :: Logistics & DMS' },
    actors: [
      { id: 'admin',      name: 'Admin',      x: 82, y: 125 },
      { id: 'dispatcher', name: 'Dispatcher', x: 82, y: 348 },
    ],
    usecases: [
      { id: 'upload-doc',    lines: ['Upload', 'Document'],           x: 296, y: 148 },
      { id: 'classify',      lines: ['Classify', 'Document'],         x: 508, y: 148 },
      { id: 'search',        lines: ['Relational', 'Search'],         x: 296, y: 270 },
      { id: 'manage-sites',  lines: ['Manage', 'Sites'],              x: 508, y: 270 },
      { id: 'gov-data',      lines: ['Gov Data', 'Lookup'],           x: 296, y: 390 },
      { id: 'dms-dash',      lines: ['View DMS', 'Dashboard'],        x: 508, y: 390 },
      { id: 'track-expiry',  lines: ['Track Document', 'Expiry'],     x: 352, y: 500, rx: 80 },
      { id: 'send-alerts',   lines: ['Send Expiry', 'Alerts'],        x: 566, y: 490, rx: 76 },
    ],
    rels: [
      { from: 'admin',      to: 'upload-doc',   kind: 'association' },
      { from: 'dispatcher', to: 'upload-doc',   kind: 'association' },
      { from: 'upload-doc', to: 'classify',     kind: 'include' },
      { from: 'admin',      to: 'search',       kind: 'association', fromMult: '1', toMult: '1..*' },
      { from: 'dispatcher', to: 'search',       kind: 'association' },
      { from: 'admin',      to: 'manage-sites', kind: 'association' },
      { from: 'admin',      to: 'gov-data',     kind: 'association' },
      { from: 'admin',      to: 'dms-dash',     kind: 'association' },
      { from: 'dispatcher', to: 'dms-dash',     kind: 'association' },
      { from: 'admin',      to: 'track-expiry', kind: 'association' },
      { from: 'send-alerts',to: 'track-expiry', kind: 'extend' },
      { from: 'admin',      to: 'dispatcher',   kind: 'generalization' },
    ],
  },

  // ── 5. AI DMS ────────────────────────────────────────────────────────────────
  {
    id: 'ai-dms', menuLabel: 'AI DMS',
    title: 'Upload · OCR · AI Classification · Registry · Archive · Sample Extractor',
    color: '#a855f7',
    boundary: { x: 165, y: 38, w: 588, h: 535, stereotype: 'Module', name: 'TMS Pro :: AI DMS' },
    actors: [
      { id: 'admin', name: 'Admin',       x: 82, y: 125 },
      { id: 'user',  name: 'System\nUser', x: 82, y: 358 },
    ],
    usecases: [
      { id: 'upload-ai',  lines: ['Upload', 'Document'],            x: 296, y: 148 },
      { id: 'ocr',        lines: ['OCR Text', 'Extraction'],        x: 508, y: 148, rx: 76 },
      { id: 'ai-classify',lines: ['AI Classification', '& Tagging'],x: 660, y: 215, rx: 82 },
      { id: 'registry',   lines: ['Browse Document', 'Registry'],   x: 296, y: 275, rx: 80 },
      { id: 'archive',    lines: ['Archive', 'Document'],           x: 296, y: 395 },
      { id: 'extract',    lines: ['Extract Compliance', 'Samples'], x: 510, y: 328, rx: 82 },
      { id: 'review',     lines: ['Review Extracted', 'Results'],   x: 658, y: 400, rx: 82 },
      { id: 'sem-search', lines: ['Semantic', 'Search'],            x: 400, y: 500, rx: 74 },
    ],
    rels: [
      { from: 'admin',     to: 'upload-ai',  kind: 'association' },
      { from: 'user',      to: 'upload-ai',  kind: 'association', fromMult: '1..*', toMult: '1' },
      { from: 'upload-ai', to: 'ocr',        kind: 'include' },
      { from: 'ocr',       to: 'ai-classify',kind: 'include' },
      { from: 'user',      to: 'registry',   kind: 'association' },
      { from: 'admin',     to: 'registry',   kind: 'association' },
      { from: 'admin',     to: 'archive',    kind: 'association' },
      { from: 'user',      to: 'extract',    kind: 'association' },
      { from: 'extract',   to: 'review',     kind: 'include' },
      { from: 'user',      to: 'sem-search', kind: 'association' },
      { from: 'archive',   to: 'registry',   kind: 'extend' },
      { from: 'admin',     to: 'user',       kind: 'generalization' },
    ],
  },

  // ── 6. Financials ────────────────────────────────────────────────────────────
  {
    id: 'financials', menuLabel: 'Financials',
    title: 'Trip Allowances · Rate Config · Auto-Ledger · Reports',
    color: '#f59e0b',
    boundary: { x: 165, y: 38, w: 588, h: 535, stereotype: 'Module', name: 'TMS Pro :: Financials' },
    actors: [
      { id: 'admin',      name: 'Admin',         x: 82,  y: 125 },
      { id: 'dispatcher', name: 'Dispatcher',    x: 82,  y: 338 },
      { id: 'system',     name: 'System\n(Auto)',x: 842, y: 270 },
    ],
    usecases: [
      { id: 'view-allow',  lines: ['View Trip', 'Allowances'],          x: 328, y: 158, rx: 78 },
      { id: 'config-rates',lines: ['Configure Rate', 'per KM'],         x: 548, y: 158, rx: 78 },
      { id: 'heavy-rate',  lines: ['Apply Heavy', 'Rate (≥10T)'],       x: 662, y: 280, rx: 82 },
      { id: 'auto-calc',   lines: ['Auto-Calculate', 'Trip Ledger'],    x: 328, y: 290, rx: 82 },
      { id: 'release-res', lines: ['Release Vehicle', '& Driver'],      x: 558, y: 380, rx: 80 },
      { id: 'view-reports',lines: ['View Financial', 'Reports'],        x: 328, y: 415, rx: 82 },
      { id: 'export',      lines: ['Export Allowance', 'Data'],         x: 540, y: 495, rx: 80 },
    ],
    rels: [
      { from: 'admin',      to: 'view-allow',  kind: 'association', fromMult: '1', toMult: '1..*' },
      { from: 'dispatcher', to: 'view-allow',  kind: 'association' },
      { from: 'admin',      to: 'config-rates',kind: 'association' },
      { from: 'heavy-rate', to: 'config-rates',kind: 'extend' },
      { from: 'system',     to: 'auto-calc',   kind: 'association' },
      { from: 'system',     to: 'release-res', kind: 'association' },
      { from: 'auto-calc',  to: 'release-res', kind: 'include' },
      { from: 'admin',      to: 'view-reports',kind: 'association' },
      { from: 'dispatcher', to: 'view-reports',kind: 'association' },
      { from: 'export',     to: 'view-reports',kind: 'extend' },
      { from: 'admin',      to: 'dispatcher',  kind: 'generalization' },
    ],
  },

  // ── 7. Knowledge ─────────────────────────────────────────────────────────────
  {
    id: 'knowledge', menuLabel: 'Knowledge',
    title: 'System Spec & ERDs · FAQ / SOP · UML Diagrams · About',
    color: '#06b6d4',
    boundary: { x: 165, y: 38, w: 588, h: 535, stereotype: 'Module', name: 'TMS Pro :: Knowledge' },
    actors: [
      { id: 'admin',    name: 'Admin',        x: 82, y: 125 },
      { id: 'any-user', name: 'System\nUser', x: 82, y: 355 },
    ],
    usecases: [
      { id: 'spec-erds',    lines: ['View System', 'Spec & ERDs'],    x: 316, y: 158, rx: 80 },
      { id: 'faq-sop',      lines: ['Browse', 'FAQ / SOP'],           x: 536, y: 158 },
      { id: 'about',        lines: ['View About', 'TMS Pro'],         x: 316, y: 288 },
      { id: 'uml-diags',    lines: ['Access UML', 'Diagrams'],        x: 536, y: 288 },
      { id: 'erd-actors',   lines: ['ERD + Actors', '+ SOP'],         x: 666, y: 225, rx: 76 },
      { id: 'search-kb',    lines: ['Search', 'Knowledge Base'],      x: 376, y: 418, rx: 80 },
      { id: 'download',     lines: ['Download', 'Documentation'],     x: 560, y: 430 },
    ],
    rels: [
      { from: 'admin',     to: 'spec-erds', kind: 'association' },
      { from: 'admin',     to: 'faq-sop',   kind: 'association' },
      { from: 'any-user',  to: 'faq-sop',   kind: 'association', fromMult: '1..*', toMult: '1' },
      { from: 'any-user',  to: 'about',     kind: 'association' },
      { from: 'admin',     to: 'uml-diags', kind: 'association' },
      { from: 'any-user',  to: 'uml-diags', kind: 'association' },
      { from: 'uml-diags', to: 'erd-actors',kind: 'include' },
      { from: 'admin',     to: 'search-kb', kind: 'association' },
      { from: 'any-user',  to: 'search-kb', kind: 'association' },
      { from: 'download',  to: 'search-kb', kind: 'extend' },
      { from: 'admin',     to: 'any-user',  kind: 'generalization' },
    ],
  },

  // ── 8. Admin ─────────────────────────────────────────────────────────────────
  {
    id: 'admin-module', menuLabel: 'Admin',
    title: 'Users · Permissions · Settings · Notifications · Face ID',
    color: '#64748b',
    boundary: { x: 165, y: 38, w: 588, h: 535, stereotype: 'Module', name: 'TMS Pro :: Admin' },
    actors: [
      { id: 'administrator', name: 'Administrator', x: 82, y: 258 },
    ],
    usecases: [
      { id: 'create-user',    lines: ['Create / Manage', 'Users'],       x: 306, y: 148, rx: 80 },
      { id: 'assign-role',    lines: ['Assign', 'User Role'],            x: 538, y: 148 },
      { id: 'config-perms',   lines: ['Configure', 'Permissions'],      x: 660, y: 232, rx: 78 },
      { id: 'mgr-settings',   lines: ['Manage App', 'Settings'],        x: 306, y: 278, rx: 78 },
      { id: 'toggle-macos',   lines: ['Toggle', 'MacOS Mode'],          x: 536, y: 300 },
      { id: 'face-enroll',    lines: ['Enroll Face ID', 'Biometric'],   x: 306, y: 415, rx: 80 },
      { id: 'notifications',  lines: ['Manage', 'Notifications'],       x: 306, y: 515 },
      { id: 'send-notif',     lines: ['Send System', 'Alerts'],         x: 536, y: 430, rx: 78 },
    ],
    rels: [
      { from: 'administrator', to: 'create-user',   kind: 'association', fromMult: '1', toMult: '1..*' },
      { from: 'administrator', to: 'assign-role',   kind: 'association' },
      { from: 'assign-role',   to: 'config-perms',  kind: 'include' },
      { from: 'administrator', to: 'mgr-settings',  kind: 'association' },
      { from: 'toggle-macos',  to: 'mgr-settings',  kind: 'extend' },
      { from: 'administrator', to: 'face-enroll',   kind: 'association' },
      { from: 'administrator', to: 'notifications', kind: 'association' },
      { from: 'notifications', to: 'send-notif',    kind: 'include' },
    ],
  },
];

// ─── Legend component ─────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-5 text-[10px] font-bold text-slate-500 px-1">
      {/* Association */}
      <span className="flex items-center gap-1.5">
        <svg width="28" height="6" style={{ overflow: 'visible' }}>
          <line x1="1" y1="3" x2="27" y2="3" stroke="#1e293b" strokeWidth="1.5" />
        </svg>
        Association
      </span>
      {/* Include */}
      <span className="flex items-center gap-1.5">
        <svg width="28" height="6" style={{ overflow: 'visible' }}>
          <line x1="1" y1="3" x2="22" y2="3" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,3" />
          <polyline points="19,0.5 27,3 19,5.5" fill="none" stroke="#475569" strokeWidth="1.5" />
        </svg>
        <span className="italic">«include»</span>
      </span>
      {/* Extend */}
      <span className="flex items-center gap-1.5">
        <svg width="28" height="6" style={{ overflow: 'visible' }}>
          <line x1="1" y1="3" x2="22" y2="3" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,3" />
          <polyline points="19,0.5 27,3 19,5.5" fill="none" stroke="#475569" strokeWidth="1.5" />
        </svg>
        <span className="italic">«extend»</span>
      </span>
      {/* Generalization */}
      <span className="flex items-center gap-1.5">
        <svg width="28" height="10" style={{ overflow: 'visible' }}>
          <line x1="1" y1="5" x2="18" y2="5" stroke="#1e293b" strokeWidth="1.5" />
          <polygon points="16,1 26,5 16,9" fill="white" stroke="#1e293b" strokeWidth="1.5" />
        </svg>
        Generalization
      </span>
      {/* Multiplicity */}
      <span className="flex items-center gap-1.5 text-slate-400">
        <span className="font-mono text-xs">1..* &nbsp; 1</span>
        Multiplicity
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UMLUseCasePage() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = DIAGRAMS.length;
  const diagram = DIAGRAMS[current];

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => setCurrent(p => (p + 1) % total), 7000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, total]);

  const prev = () => setCurrent(p => (p - 1 + total) % total);
  const next = () => setCurrent(p => (p + 1) % total);

  return (
    <div className={
      fullscreen
        ? 'fixed inset-0 z-[9999] bg-white flex flex-col p-4 gap-3'
        : 'flex flex-col p-5 gap-3 h-[calc(100vh-80px)]'
    }>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            UML Use Case Diagrams
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard UML notation · Actors · System boundary · «include» · «extend» · Generalization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying(p => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              playing
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
            }`}
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
            {playing ? 'Pause' : 'Play Slideshow'}
          </button>
          <button
            onClick={() => setFullscreen(f => !f)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex flex-1 gap-3 min-h-0">

        {/* Sidebar */}
        <div className="w-38 flex-shrink-0 flex flex-col gap-1.5 overflow-y-auto pr-0.5">
          {DIAGRAMS.map((d, i) => (
            <button
              key={d.id}
              onClick={() => setCurrent(i)}
              className="w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all border"
              style={
                i === current
                  ? { background: d.color, color: 'white', borderColor: 'transparent' }
                  : { background: 'white', color: '#475569', borderColor: '#f1f5f9' }
              }
            >
              {d.menuLabel}
            </button>
          ))}
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col gap-2 min-w-0 min-h-0">

          {/* Module header + legend */}
          <div className="flex-shrink-0 bg-white rounded-xl border border-slate-100 px-4 py-2.5 flex flex-col gap-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span
                  className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white mr-2"
                  style={{ background: diagram.color }}
                >
                  {diagram.menuLabel}
                </span>
                <span className="text-xs font-semibold text-slate-500">{diagram.title}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {current + 1} / {total}
              </span>
            </div>
            <Legend />
          </div>

          {/* SVG Canvas */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <DiagramSVG diagram={diagram} />
          </div>

          {/* Navigation controls */}
          <div className="flex-shrink-0 flex items-center justify-between">
            {/* Prev / Next */}
            <div className="flex items-center gap-2">
              <button onClick={prev}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition text-slate-600">
                <ChevronLeft size={18} />
              </button>
              <button onClick={next}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition text-slate-600">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center gap-1.5">
              {DIAGRAMS.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => setCurrent(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? 22 : 8,
                    height: 8,
                    background: i === current ? d.color : '#cbd5e1',
                  }}
                />
              ))}
            </div>

            {/* Module name */}
            <span className="text-xs font-bold text-slate-400">{diagram.menuLabel} Module</span>
          </div>
        </div>
      </div>
    </div>
  );
}
