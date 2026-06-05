import React, { useState, useEffect } from 'react';
import { searchMaps, searchMapNodes } from '../api/mapService';

interface SearchBarProps {
    currentMapId: number | null;
    onSelectMap: (mapId: number) => void;
    onSelectNode: (nodeId: string, type: 'room' | 'node', floor: number) => void;
}

export function SearchBar({ currentMapId, onSelectMap, onSelectNode }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const fetchResults = async (q: string) => {
        setLoading(true);
        try {
            if (currentMapId === null) {
                const data = await searchMaps(q);
                setResults(data);
                setIsOpen(true);
            } else {
                const data = await searchMapNodes(currentMapId, q);
                setResults(data);
                setIsOpen(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (query === '' && !isOpen) {
            return;
        }

        const timer = setTimeout(() => {
            fetchResults(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, currentMapId]);

    return (
        <div style={{ position: 'relative', width: '300px', zIndex: 50 }}>
            <input
                type="text"
                placeholder={currentMapId === null ? "Search for a map..." : "Search rooms or nodes..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                    if (!isOpen) {
                        fetchResults(query);
                    }
                }}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', color: '#000' }}
            />

            {isOpen && results.length > 0 && (
                <ul style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'white', border: '1px solid #ccc', borderRadius: '4px',
                    marginTop: '4px', padding: 0, listStyle: 'none', maxHeight: '300px', overflowY: 'auto'
                }}>
                    {results.map((r, i) => (
                        <li
                            key={i}
                            style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                            onClick={() => {
                                if (currentMapId === null) {
                                    onSelectMap(r.id);
                                    setQuery("");
                                    setIsOpen(false);
                                } else {
                                    // Node click
                                    // r.id is the database id, so it translates to string 'id' in frontend for map features
                                    onSelectNode(String(r.id), r.node_kind === 'room' ? 'room' : 'node', r.floor);
                                    setQuery("");
                                    setIsOpen(false);
                                }
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f0f0f0';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                            }}
                        >
                            {currentMapId === null ? (
                                <div>
                                    <strong>{r.name}</strong>
                                    <div style={{ fontSize: '12px', color: '#666' }}>By: {r.user_email || 'Unknown'}</div>
                                </div>
                            ) : (
                                <div>
                                    <strong>{r.name}</strong>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Floor: {r.floor} • {r.node_kind === 'room' ? 'Room' : r.node_type || 'Node'}</div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {!loading && isOpen && results.length === 0 && query && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'white', border: '1px solid #ccc', borderRadius: '4px',
                    marginTop: '4px', padding: '10px'
                }}>
                    No results found.
                </div>
            )}
        </div>
    );
}
