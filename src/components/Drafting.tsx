import { jsPDF } from 'jspdf'
import { FileDown, FileText } from 'lucide-react'

interface DraftingProps {
    firData: any
}

export default function Drafting({ firData }: DraftingProps) {
    const draftContent = `
IN THE COURT OF THE HON'BLE DISTRICT JUDGE, ${(firData.district || firData.location || "SEARCHED DISTRICT").toUpperCase()}

IN THE MATTER OF:
State vs. ${firData.accused?.[0] || "Accused"} & Others
Police Station: ${firData.policeStation || "Unknown"}
FIR No: ${firData.firNumber || "N/A"}
U/s: ${Array.isArray(firData.sections) ? firData.sections.join(', ') : "N/A"}

Subject: APPLICATION FOR PRELIMINARY REVIEW AND BAIL SYNOPSIS

Respected Sir/Madam,

The applicant respectfully submits that the present FIR filed on ${firData.incidentDate || firData.date || "N/A"} is based on circumstantial evidence as stated in the incident summary: "${firData.summary || firData.incidentSummary || "Details unavailable"}".

The complainant, ${firData.complainant || "Complainant"}, has failed to provide direct eyewitness testimony connecting the accused specifically to the primary offence under Section 302 IPC.

PRAYER:
It is therefore prayed that this Hon'ble Court may be pleased to take notice of the inconsistencies in the FIR extraction and grant necessary relief as per law.

Counsel for the Accused
Dated: ${new Date().toLocaleDateString()}
  `

    const downloadPDF = () => {
        const doc = new jsPDF()
        doc.setFontSize(16)
        doc.text("LEGAL DRAFTING SYNOPSIS", 105, 20, { align: 'center' })
        doc.setFontSize(10)
        const splitText = doc.splitTextToSize(draftContent, 180)
        doc.text(splitText, 15, 40)
        doc.save(`Drafting_${firData.firNumber.replace('/', '-')}.pdf`)
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Legal Drafting</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>AI-assisted drafting based on FIR details.</p>
                </div>
                <button onClick={downloadPDF} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileDown size={20} />
                    Download PDF
                </button>
            </div>

            <div className="glass-card" style={{ padding: '40px', background: 'white', color: '#1e293b', minHeight: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                <pre style={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: '"Times New Roman", Times, serif',
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    borderLeft: '4px solid var(--primary)',
                    paddingLeft: '24px'
                }}>
                    {draftContent}
                </pre>
            </div>
        </div>
    )
}
