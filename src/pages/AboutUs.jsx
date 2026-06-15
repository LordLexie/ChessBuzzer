import { Link } from 'react-router-dom';
import { CHESS } from '../components/ui/Icons';

function AboutUs() {
    return (
        <div style={{ minHeight: '100vh', background: '#0C1310', display: 'flex', flexDirection: 'column', color: '#E8F1EB', boxSizing: 'border-box' }}>

            {/* Nav */}
            <header style={{
                width: '100%',
                padding: '18px clamp(16px, 4vw, 40px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #16221C',
                background: '#0A120E',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                boxSizing: 'border-box',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(150deg,#3BE089,#1E8A52)', display: 'grid', placeItems: 'center', fontSize: 20, color: '#06140C', flexShrink: 0 }}>
                        {CHESS.knight}
                    </div>
                    <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 16, color: '#E8F1EB' }}>Chess Buzzer</span>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <Link to="/rankings" style={{ color: '#8A9D92', fontSize: 13, textDecoration: 'none' }}>Leaderboard</Link>
                    <Link to="/" style={{
                        background: '#3BE089', color: '#06140C', fontWeight: 700,
                        fontSize: 13, padding: '7px 16px', borderRadius: 8, textDecoration: 'none',
                    }}>Sign In</Link>
                </div>
            </header>

            {/* Main */}
            <main style={{ flex: 1, maxWidth: 820, width: '100%', margin: '0 auto', padding: '64px 24px 80px', boxSizing: 'border-box' }}>

                {/* Hero */}
                <div style={{ marginBottom: 60 }}>
                    <div style={{ fontSize: 32, marginBottom: 16 }}>{CHESS.knight}</div>
                    <h1 style={{
                        fontFamily: "'Bricolage Grotesque',sans-serif",
                        fontWeight: 800, fontSize: 'clamp(28px, 7vw, 48px)', letterSpacing: '-.03em',
                        color: '#E8F1EB', margin: '0 0 20px', lineHeight: 1.1,
                    }}>
                        Where Chess<br />
                        <span style={{ color: '#3BE089' }}>Meets Competition</span>
                    </h1>
                    <p style={{ fontSize: 17, color: '#8A9D92', lineHeight: 1.8, maxWidth: 560, margin: 0 }}>
                        Chess Buzzer is a competitive chess platform for players who want more than just a game —
                        real-stakes tournaments, live leaderboards, and instant prize payouts.
                    </p>
                </div>

                {/* Feature cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 56 }}>
                    {[
                        { icon: CHESS.king,   title: 'Competitive Play',  body: 'Join ranked tournaments and challenge players across all skill levels.' },
                        { icon: CHESS.queen,  title: 'Real Prizes',       body: 'Earn real money for your wins. Instant payouts directly to your wallet.' },
                        { icon: CHESS.rook,   title: 'Live Leaderboards', body: 'Track your rank and see how you stack up against the best.' },
                        { icon: CHESS.knight, title: 'Fair & Transparent', body: 'Every game verified. Every transaction audited and on-record.' },
                    ].map(card => (
                        <div key={card.title} style={{
                            background: '#0F1C16', border: '1px solid #1A2C22',
                            borderRadius: 14, padding: '24px 22px',
                        }}>
                            <div style={{ fontSize: 26, marginBottom: 14, lineHeight: 1 }}>{card.icon}</div>
                            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 15, color: '#E8F1EB', marginBottom: 8 }}>{card.title}</div>
                            <div style={{ fontSize: 13, color: '#8A9D92', lineHeight: 1.65 }}>{card.body}</div>
                        </div>
                    ))}
                </div>

                {/* Mission */}
                <div style={{
                    background: 'linear-gradient(135deg, #0F1C16 0%, #0A1810 100%)',
                    border: '1px solid #1A2C22', borderRadius: 16,
                    padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 36px)', marginBottom: 56,
                }}>
                    <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: '#3BE089', fontWeight: 600, marginBottom: 12 }}>Our mission</div>
                    <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 24, color: '#E8F1EB', marginBottom: 16 }}>
                        Chess for everyone who means it
                    </h2>
                    <p style={{ fontSize: 15, color: '#8A9D92', lineHeight: 1.8, margin: 0 }}>
                        We believe chess should be accessible, rewarding, and exciting — from club players to grandmasters.
                        Chess Buzzer gives every player a fair chance to compete, grow, and earn through the game they love.
                    </p>
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 22, color: '#E8F1EB' }}>Ready to play?</div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link to="/register" style={{
                            background: '#3BE089', color: '#06140C', fontWeight: 700,
                            fontSize: 14, padding: '12px 28px', borderRadius: 8, textDecoration: 'none',
                        }}>
                            Create an Account
                        </Link>
                        <Link to="/rankings" style={{
                            background: 'transparent', color: '#8A9D92', fontWeight: 600,
                            fontSize: 14, padding: '12px 28px', borderRadius: 8, textDecoration: 'none',
                            border: '1px solid #1A2C22',
                        }}>
                            View Leaderboard
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid #16221C', padding: '20px clamp(16px, 4vw, 40px)', textAlign: 'center', color: '#4A6357', fontSize: 12 }}>
                © {new Date().getFullYear()} Chess Buzzer ·{' '}
                <Link to="/rankings" style={{ color: '#4A6357', textDecoration: 'none' }}>Leaderboard</Link>
                {' · '}
                <Link to="/" style={{ color: '#4A6357', textDecoration: 'none' }}>Sign In</Link>
            </footer>
        </div>
    );
}

export default AboutUs;
