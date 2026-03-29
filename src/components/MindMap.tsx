import { useCallback, useEffect } from 'react'
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Node,
    Edge
} from 'reactflow'
import 'reactflow/dist/style.css'
import { FIRMetadata } from '../types'

interface MindMapProps {
    data: FIRMetadata | null
}

const baseNodeStyle = {
    borderRadius: '12px',
    padding: '15px',
    fontWeight: 700,
    textAlign: 'center' as const,
    color: 'white',
    width: 200,
};

const childNodeStyle = {
    borderRadius: '8px',
    padding: '10px',
    width: 140,
    color: 'var(--text-primary)',
    borderWidth: '1px',
    borderStyle: 'solid'
};

export default function MindMap({ data }: MindMapProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])

    const generateGraph = useCallback((firData: FIRMetadata) => {
        if (!firData) return { nodes: [], edges: [] };

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        // Center Root
        const rootId = 'root';
        newNodes.push({
            id: rootId,
            position: { x: 500, y: 300 },
            data: { label: `FIR ANALYSIS\n${firData.firNumber || 'LexMind System'}` },
            type: 'input',
            style: {
                background: 'var(--primary)',
                color: '#ffffff',
                borderRadius: '50%',
                width: 160,
                height: 160,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontWeight: 800,
                border: '4px solid var(--bg-main)',
                boxShadow: '0 0 30px rgba(0, 95, 115, 0.4)',
                fontSize: '0.9rem'
            }
        });

        // Helper to add branch and children
        const addBranch = (
            key: string,
            label: string,
            color: string,
            pos: { x: number, y: number },
            items: string[] = []
        ) => {
            const branchId = `branch-${key}`;

            // Add Branch Node
            newNodes.push({
                id: branchId,
                position: pos,
                data: { label },
                style: { ...baseNodeStyle, background: color }
            });

            // Add Edge from Root
            newEdges.push({
                id: `e-root-${branchId}`,
                source: rootId,
                target: branchId,
                animated: true,
                style: { stroke: color }
            });

            // Add Leaf Nodes
            items.forEach((item, i) => {
                const itemId = `${key}-${i}`;
                newNodes.push({
                    id: itemId,
                    // calculate position relative to branch
                    // Alternating sides or simple vertical stack below branch
                    // Simple approach: Stack below branch with some offset
                    position: {
                        x: pos.x + (i % 2 === 0 ? -60 : 60), // Zigzag slightly
                        y: pos.y + 100 + (i * 60)
                    },
                    data: { label: item },
                    style: {
                        ...childNodeStyle,
                        background: `${color}1A`, // 10% opacity
                        borderColor: color
                    }
                });
                newEdges.push({
                    id: `e-${branchId}-${itemId}`,
                    source: branchId,
                    target: itemId,
                    style: { stroke: color, opacity: 0.5 }
                });
            });
        };

        // 1. LEGAL SECTIONS
        addBranch('legal', '⚖️ SECTIONS', '#9b2226', { x: 200, y: 50 }, firData.sections || []);

        // 2. CASE DETAILS
        // Manually construct details array
        const details = [
            firData.location ? `Loc: ${firData.location}` : '',
            firData.incidentDate ? `Date: ${firData.incidentDate}` : ''
        ].filter(Boolean);
        addBranch('case', '📂 DETAILS', '#0a9396', { x: 800, y: 50 }, details);

        // 3. ACCUSED
        addBranch('accused', '🚫 ACCUSED', '#ae2012', { x: 200, y: 500 }, firData.accused || []);

        // 4. ENTITIES
        const entityList = [...(firData.witnesses || [])];
        if (firData.complainant) entityList.unshift(`${firData.complainant} (Complainant)`);
        addBranch('witnesses', '👥 ENTITIES', '#ca6702', { x: 800, y: 500 }, entityList);

        // 5. EVIDENCE
        const evidenceItems = firData.evidence?.map((e: any) => typeof e === 'object' ? `${e.type}: ${e.item}` : e).slice(0, 5) || [];
        addBranch('evidence', '🧠 EVIDENCE', '#005f73', { x: 500, y: 650 }, evidenceItems);

        return { nodes: newNodes, edges: newEdges };
    }, []);

    useEffect(() => {
        if (data) {
            const { nodes: n, edges: e } = generateGraph(data);
            setNodes(n);
            setEdges(e);
        }
    }, [data, generateGraph, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    )

    return (
        <div style={{ height: '100%', width: '100%', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-main)' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            >
                <Background color="var(--border)" gap={20} />
                <Controls />
                <MiniMap
                    nodeColor={(n: Node) => {
                        if (n.id === 'root') return 'var(--primary)'
                        if (n.id.startsWith('branch-')) return 'var(--accent)'
                        return 'var(--muted-bg)'
                    }}
                    maskColor="rgba(0,0,0,0.1)"
                    style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}
                />
            </ReactFlow>
        </div>
    )
}

