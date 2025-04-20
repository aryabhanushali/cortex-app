import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Stepper from "@/components/oldComponents/stepper";

export default function Lab() {
    return (
        <>
            <Navbar />
            <main className="container mt-4">
                <Stepper />
            </main>
            <Footer />
        </>
    )
}