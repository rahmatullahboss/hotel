import Link from "next/link";
import { BottomNav, Footer } from "../components";
import { getTranslations } from "next-intl/server";

export const metadata = {
    title: "Terms of Service - Zinu Rooms",
    description: "Terms of Service for Zinu Rooms hotel booking platform.",
};

export default async function TermsPage() {
    const t = await getTranslations("terms");

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
                                ১. শর্তাবলী গ্রহণ
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8 }}>
                                Zinu Rooms ("সেবা") অ্যাক্সেস বা ব্যবহার করার মাধ্যমে, আপনি এই সেবার শর্তাবলী মেনে চলতে সম্মত হচ্ছেন।
                                আপনি যদি এই শর্তাবলীতে সম্মত না হন, অনুগ্রহ করে আমাদের সেবা ব্যবহার করবেন না।
                            </p>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                ২. সেবার বিবরণ
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8 }}>
                                Zinu Rooms একটি অনলাইন প্ল্যাটফর্ম প্রদান করে যা বাংলাদেশে ভ্রমণকারীদের হোটেল আবাসনের সাথে সংযুক্ত করে।
                                আমরা অতিথি এবং হোটেল পার্টনারদের মধ্যে বুকিং সুবিধা প্রদান করি কিন্তু সরাসরি আবাসন সেবা প্রদানকারী নই।
                            </p>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                ৩. ব্যবহারকারী অ্যাকাউন্ট
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8, marginBottom: '1rem' }}>
                                সেবার নির্দিষ্ট বৈশিষ্ট্য ব্যবহার করতে, আপনাকে একটি অ্যাকাউন্ট তৈরি করতে হবে। আপনি দায়ী:
                            </p>
                            <ul style={{ color: '#64748B', lineHeight: 1.8, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                                <li>আপনার অ্যাকাউন্টের পাসওয়ার্ড গোপন রাখা</li>
                                <li>আপনার অ্যাকাউন্টে ঘটা সমস্ত কার্যকলাপ</li>
                                <li>সঠিক এবং আপডেট তথ্য প্রদান</li>
                                <li>অননুমোদিত অ্যাক্সেসের ক্ষেত্রে অবিলম্বে আমাদের জানানো</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                ৪. বুকিং এবং পেমেন্ট
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8, marginBottom: '1rem' }}>
                                আপনি যখন আমাদের প্ল্যাটফর্মের মাধ্যমে বুকিং করেন:
                            </p>
                            <ul style={{ color: '#64748B', lineHeight: 1.8, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                                <li>আপনার রিজার্ভেশন নিশ্চিত করতে বুকিং ফি প্রয়োজন</li>
                                <li>বাকি টাকা হোটেলে বা আমাদের প্ল্যাটফর্মের মাধ্যমে পরিশোধ করা যাবে</li>
                                <li>প্রদর্শিত মূল্যে প্রযোজ্য ট্যাক্স এবং ফি অন্তর্ভুক্ত</li>
                                <li>বাতিলকরণ নীতি হোটেল অনুযায়ী ভিন্ন হয় এবং বুকিংয়ের সময় প্রদর্শিত হয়</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                ৫. ওয়ালেট এবং লয়্যালটি প্রোগ্রাম
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8 }}>
                                আমাদের ওয়ালেট এবং লয়্যালটি পয়েন্ট সিস্টেম নিম্নলিখিত শর্তে পরিচালিত হয়:
                            </p>
                            <ul style={{ color: '#64748B', lineHeight: 1.8, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                                <li>ওয়ালেট ব্যালেন্স শুধুমাত্র আমাদের প্ল্যাটফর্মে ব্যবহারযোগ্য</li>
                                <li>পয়েন্ট বুকিং সম্পন্ন হলে অর্জিত হয়</li>
                                <li>আমরা যেকোনো সময় প্রোগ্রাম পরিবর্তন করার অধিকার রাখি</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                ৬. যোগাযোগ
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8 }}>
                                এই শর্তাবলী সম্পর্কে কোনো প্রশ্ন থাকলে, আমাদের সাথে যোগাযোগ করুন:
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
