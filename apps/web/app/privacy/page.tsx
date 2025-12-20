import Link from "next/link";
import { BottomNav, Footer } from "../components";
import { getTranslations } from "next-intl/server";

export const metadata = {
    title: "Privacy Policy - Zinu Rooms",
    description: "Privacy Policy for Zinu Rooms hotel booking platform.",
};

export default async function PrivacyPage() {
    const t = await getTranslations("privacy");

    return (
        <>
            <main style={{ padding: '2rem 0 4rem', background: '#F8FAFC', minHeight: '100vh' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>
                            {t("title")}
                        </h1>
                        <p style={{ color: '#64748B' }}>{t("lastUpdated")}</p>
                    </div>

                    {/* Content */}
                    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                ১. তথ্য সংগ্রহ
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8, marginBottom: '1rem' }}>
                                আমরা আপনার কাছ থেকে নিম্নলিখিত তথ্য সংগ্রহ করি:
                            </p>
                            <ul style={{ color: '#64748B', lineHeight: 1.8, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                                <li>ব্যক্তিগত তথ্য (নাম, ইমেল, ফোন নম্বর)</li>
                                <li>বুকিং তথ্য এবং পেমেন্ট বিবরণ</li>
                                <li>ডিভাইস এবং ব্রাউজার তথ্য</li>
                                <li>লোকেশন তথ্য (আপনার অনুমতিতে)</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                ২. তথ্য ব্যবহার
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8, marginBottom: '1rem' }}>
                                আমরা আপনার তথ্য ব্যবহার করি:
                            </p>
                            <ul style={{ color: '#64748B', lineHeight: 1.8, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                                <li>আপনার বুকিং প্রক্রিয়া এবং নিশ্চিত করতে</li>
                                <li>কাস্টমার সাপোর্ট প্রদান করতে</li>
                                <li>আমাদের সেবা উন্নত করতে</li>
                                <li>প্রচারমূলক অফার পাঠাতে (আপনার সম্মতিতে)</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                ৩. তথ্য সুরক্ষা
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8 }}>
                                আমরা আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে শিল্প-মান নিরাপত্তা ব্যবস্থা ব্যবহার করি।
                                এতে SSL এনক্রিপশন, সুরক্ষিত সার্ভার এবং নিয়মিত নিরাপত্তা অডিট অন্তর্ভুক্ত।
                            </p>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                ৪. তথ্য শেয়ারিং
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8, marginBottom: '1rem' }}>
                                আমরা আপনার তথ্য শেয়ার করতে পারি:
                            </p>
                            <ul style={{ color: '#64748B', lineHeight: 1.8, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                                <li>হোটেল পার্টনারদের সাথে (বুকিং সম্পন্ন করতে)</li>
                                <li>পেমেন্ট প্রসেসরদের সাথে</li>
                                <li>আইনি প্রয়োজনে কর্তৃপক্ষের কাছে</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                ৫. আপনার অধিকার
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8, marginBottom: '1rem' }}>
                                আপনার নিম্নলিখিত অধিকার রয়েছে:
                            </p>
                            <ul style={{ color: '#64748B', lineHeight: 1.8, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                                <li>আপনার তথ্য অ্যাক্সেস এবং সংশোধন করা</li>
                                <li>আপনার অ্যাকাউন্ট মুছে ফেলার অনুরোধ</li>
                                <li>মার্কেটিং যোগাযোগ থেকে বের হওয়া</li>
                                <li>আপনার ডেটা পোর্টেবিলিটি</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                ৬. কুকিজ
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8 }}>
                                আমরা কুকিজ এবং অনুরূপ প্রযুক্তি ব্যবহার করি আপনার অভিজ্ঞতা উন্নত করতে।
                                আপনি আপনার ব্রাউজার সেটিংস থেকে কুকিজ নিয়ন্ত্রণ করতে পারেন।
                            </p>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                ৭. যোগাযোগ
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8 }}>
                                গোপনীয়তা সংক্রান্ত কোনো প্রশ্ন থাকলে, আমাদের সাথে যোগাযোগ করুন:
                                <br /><br />
                                ইমেল: rahmatullahzisan@gmail.com<br />
                                ফোন: +880 1739 416661
                            </p>
                        </section>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Link href="/" style={{ color: '#E63946', fontWeight: 600, textDecoration: 'none' }}>
                            ← হোমে ফিরে যান
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
            <BottomNav />
        </>
    );
}
