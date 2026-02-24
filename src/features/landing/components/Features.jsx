import multipleUsers from "../../../assets/icons/multiple-users.svg";
import idCard from "../../../assets/icons/id-cards.svg";

export default function Features() {
    const features = [
        {
            id: 1,
            title: "Registry of Barangay Inhabitants",
            icon: <img src={multipleUsers} alt="Multiple Users Icon" className="w-[175px] h-[175px]" />
        },
        {
            id: 2,
            title: "Digital Barangay ID with QR Code",
            icon: <img src={idCard} alt="ID Card Icon" className="w-[175px] h-[175px]" /> 
        },
    ];

    return (
        <section className="w-full py-15 bg-gray-50 px-8 md:px-40">
            {/* Text Header */}
            <div className="mx-auto mb-16 ml-10">   
                <p className="text-lg font-semibold text-[#005F02] mb-2">● Features</p>
                <h1 className="font-bold text-4xl text-[#005F02]">What The System Offers</h1>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {features.map((feature) => (
                    <div
                        key={feature.id}
                        className="border-2 mx- border-[#005F02] rounded-lg p-15 mx-15 flex flex-col items-center text-center bg-white hover:shadow-2xl transition-shadow duration-300"
                    >
                        {/* Icon */}
                        <div className="mb-4">
                            {feature.icon}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-[#005F02]">
                            {feature.title}
                        </h3>
                    </div>
                ))}
            </div>
        </section>
    );
}