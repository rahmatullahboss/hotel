"use client";

import { FiPhone, FiMail, FiEdit3 } from "react-icons/fi";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1.5rem',
    },
    heading: {
        fontSize: '1.75rem',
        fontWeight: 700,
        color: '#1d3557',
        marginBottom: '0.5rem',
    },
    description: {
        color: '#64748b',
        fontSize: '1rem',
        marginBottom: '0.5rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#334155',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    labelIcon: {
        color: '#64748b',
    },
    input: {
        width: '100%',
        padding: '0.875rem 1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '0.75rem',
        fontSize: '1rem',
        background: 'white',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        outline: 'none',
    },
    textarea: {
        width: '100%',
        padding: '0.875rem 1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '0.75rem',
        fontSize: '1rem',
        background: 'white',
        resize: 'vertical' as const,
        minHeight: '120px',
        fontFamily: 'inherit',
        lineHeight: 1.6,
    },
    hint: {
        fontSize: '0.8125rem',
        color: '#94a3b8',
        marginTop: '0.25rem',
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
    },
};

export function BasicInfoStep({ data, updateData }: Props) {
    return (
        <div style={styles.container}>
            <div>
                <h2 style={styles.heading}>Tell us about your hotel</h2>
                <p style={styles.description}>
                    Start with the basic information that guests will see first.
                </p>
            </div>

            <div style={styles.formGroup}>
                <label htmlFor="name" style={styles.label}>
                    <FiEdit3 style={styles.labelIcon} /> Hotel Name *
                </label>
                <input
                    type="text"
                    id="name"
                    value={data.name}
                    onChange={(e) => updateData({ name: e.target.value })}
                    placeholder="e.g., Grand Vibe Hotel"
                    style={styles.input}
                />
            </div>

            <div style={styles.formGroup}>
                <label htmlFor="description" style={styles.label}>
                    Description *
                </label>
                <textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => updateData({ description: e.target.value })}
                    placeholder="Tell guests what makes your hotel special..."
                    style={styles.textarea}
                />
                <span style={styles.hint}>
                    Write about your hotel's unique features, nearby attractions, and what guests can expect.
                </span>
            </div>

            <div style={styles.formRow}>
                <div style={styles.formGroup}>
                    <label htmlFor="phone" style={styles.label}>
                        <FiPhone style={styles.labelIcon} /> Contact Phone *
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        value={data.phone}
                        onChange={(e) => updateData({ phone: e.target.value })}
                        placeholder="+880 1XXX-XXXXXX"
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label htmlFor="email" style={styles.label}>
                        <FiMail style={styles.labelIcon} /> Email (Optional)
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={data.email}
                        onChange={(e) => updateData({ email: e.target.value })}
                        placeholder="hotel@example.com"
                        style={styles.input}
                    />
                </div>
            </div>
        </div>
    );
}
