import ScoreboardPage from '@/components/oldComponents/scoreboard-page';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Scoreboard() {
    return (
        <>
            <Navbar />
            <main className="container mt-4">
                {/* <ScoreboardPage /> */}
                <div className="text-center py-5 my-5">
                    <i className="bi bi-emoji-smile" style={{ fontSize: '64px', color: '#1890ff', marginBottom: '24px', display: 'block' }}></i>
                    <h1 className="display-4 fw-bold">Scoreboard Coming Soon</h1>
                    <p className="lead text-muted mb-4">
                        We're working hard to bring you a comprehensive model performance scoreboard.
                        Check back soon for detailed comparisons across datasets and regions.
                    </p>
                    <div className="border-top border-bottom py-4 my-4 w-75 mx-auto">
                        <p className="mb-0">
                            The scoreboard will feature performance metrics for various models across different 
                            brain regions and evaluation datasets.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}