"use client";

import { FiPhone, FiMail } from "react-icons/fi";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
}

export function BasicInfoStep({ data, updateData }: Props) {
    return (
        <div className="step-content">
            <h2 className="step-heading">Tell us about your hotel</h2>
            <p className="step-description">
                Start with the basic information that guests will see first.
            </p>

            <div className="form-group">
                <label htmlFor="name" className="form-label">
                    Hotel Name *
                </label>
                <input
                    type="text"
                    id="name"
                    value={data.name}
                    onChange={(e) => updateData({ name: e.target.value })}
                    placeholder="e.g., Grand Vibe Hotel"
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label htmlFor="description" className="form-label">
                    Description *
                </label>
                <textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => updateData({ description: e.target.value })}
                    placeholder="Tell guests what makes your hotel special..."
                    rows={4}
                    className="form-input"
                />
                <span className="form-hint">
                    Write about your hotel's unique features, nearby attractions, and what guests can expect.
                </span>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                        <FiPhone className="label-icon" /> Contact Phone *
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        value={data.phone}
                        onChange={(e) => updateData({ phone: e.target.value })}
                        placeholder="+880 1XXX-XXXXXX"
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email" className="form-label">
                        <FiMail className="label-icon" /> Email (Optional)
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={data.email}
                        onChange={(e) => updateData({ email: e.target.value })}
                        placeholder="hotel@example.com"
                        className="form-input"
                    />
                </div>
            </div>
        </div>
    );
}
