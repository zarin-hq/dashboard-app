import { useMemo } from 'react'
import { getModuleForPage } from '../../lib/proposalData'

const NODE_W = 140
const NODE_H = 36
const GAP_X = 24
const GAP_Y = 56

/**
 * Filter a sitemap tree to only include nodes whose names belong to the given module.
 * Keeps parent nodes if any descendant matches.
 */
function filterTreeByModule(node, moduleId) {
  if (moduleId === 'all') return node

  const matches = getModuleForPage(node.name) === moduleId
  const filteredChildren = (node.children || [])
    .map((child) => filterTreeByModule(child, moduleId))
    .filter(Boolean)

  if (matches || filteredChildren.length > 0) {
    return { ...node, children: filteredChildren }
  }
  return null
}

/**
 * Recursive layout: returns { node, x, y, width (subtree width), children[] }
 */
function layoutTree(node, x = 0, y = 0) {
  if (!node.children || node.children.length === 0) {
    return { node, x, y, width: NODE_W, children: [] }
  }

  const laid = []
  let cursor = x
  for (const child of node.children) {
    const c = layoutTree(child, cursor, y + NODE_H + GAP_Y)
    laid.push(c)
    cursor = c.x + c.width + GAP_X
  }

  const totalWidth = cursor - GAP_X - x
  const centerX = x + totalWidth / 2 - NODE_W / 2

  return {
    node,
    x: centerX,
    y,
    width: totalWidth,
    children: laid,
  }
}

function renderNode(layout, onClickPage) {
  const { node, x, y, children } = layout
  const matched = !!node.pageId
  const cx = x + NODE_W / 2
  const cy = y + NODE_H / 2

  const elements = []

  // Connector lines from this node to children
  for (const child of children) {
    const childCx = child.x + NODE_W / 2
    const midY = y + NODE_H + GAP_Y / 2
    elements.push(
      <path
        key={`line-${node.name}-${child.node.name}`}
        d={`M ${cx} ${y + NODE_H} L ${cx} ${midY} L ${childCx} ${midY} L ${childCx} ${child.y}`}
        fill="none"
        stroke="#E4D5C3"
        strokeWidth={2}
      />
    )
  }

  // Node rect
  elements.push(
    <g
      key={`node-${node.name}`}
      onClick={() => node.pageId && onClickPage(node.pageId)}
      style={{ cursor: node.pageId ? 'pointer' : 'default' }}
    >
      <rect
        x={x}
        y={y}
        width={NODE_W}
        height={NODE_H}
        rx={8}
        fill={matched ? '#84D7DC' : 'white'}
        stroke={matched ? '#264A50' : '#BCAB96'}
        strokeWidth={matched ? 2 : 1.5}
        strokeDasharray={matched ? 'none' : '6 3'}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={matched ? 600 : 400}
        fill={matched ? '#264A50' : '#7C8E8E'}
      >
        {node.name.length > 16 ? node.name.slice(0, 15) + '…' : node.name}
      </text>
    </g>
  )

  // Recurse children
  for (const child of children) {
    elements.push(...renderNode(child, onClickPage))
  }

  return elements
}

export default function Sitemap({ sitemapRoot, onClickPage, activeModuleId = 'all' }) {
  const filteredRoot = useMemo(() => {
    const result = filterTreeByModule(sitemapRoot, activeModuleId)
    return result || { name: 'No pages', children: [] }
  }, [sitemapRoot, activeModuleId])

  const layout = useMemo(() => layoutTree(filteredRoot), [filteredRoot])

  // Compute SVG bounds
  function getBounds(l) {
    let minX = l.x, maxX = l.x + NODE_W, maxY = l.y + NODE_H
    for (const c of l.children) {
      const b = getBounds(c)
      minX = Math.min(minX, b.minX)
      maxX = Math.max(maxX, b.maxX)
      maxY = Math.max(maxY, b.maxY)
    }
    return { minX, maxX, maxY }
  }

  const bounds = getBounds(layout)
  const padding = 20
  const svgW = bounds.maxX - bounds.minX + padding * 2
  const svgH = bounds.maxY + padding * 2

  return (
    <div className="rounded-xl border border-tan bg-sand-light p-5 space-y-3">
      <div className="overflow-x-auto">
        <svg
          width={svgW}
          height={svgH}
          viewBox={`${bounds.minX - padding} ${-padding} ${svgW} ${svgH}`}
          className="mx-auto block"
        >
          {renderNode(layout, onClickPage)}
        </svg>
      </div>
      <div className="flex items-center gap-4 text-xs text-deep-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-sky border border-deep inline-block" />
          Matched page
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-dashed border-tan-dark inline-block" />
          Template (no page)
        </span>
      </div>
    </div>
  )
}
