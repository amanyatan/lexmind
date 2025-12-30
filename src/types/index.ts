export interface FIRMetadata {
    firNumber: string;
    incidentDate: string;
    location: string;
    sections: string[];
    summary: string;
    accused: string[];
    witnesses: string[];
    evidence: string[];
    ipcProvisions?: string[];
    legalStrategy?: string[];
    defenseStrategy?: string[];
    timeline?: Array<{ date: string; event: string }>;
    [key: string]: any;
}

export interface FIRRecord {
    id: string;
    created_at: string;
    user_id: string;
    fir_number: string;
    filename: string;
    storage_path: string;
    metadata: FIRMetadata;
}

export interface UserContext {
    id: string;
    email: string;
    full_name?: string;
}
