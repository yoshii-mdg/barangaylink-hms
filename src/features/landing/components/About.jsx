import CheckList from "../../../assets/icons/check-list.svg";
import aboutUsImage from "../../../assets/images/about-us-pic.png";

export default function About() {
    return (
        <section className="w-full py-30 bg-gray-50 px-8 md:px-40 mt-30">
            {/* Text Header */}
            <div className="mx-auto mb-16 ml-10">
                <p className="text-lg text-[#005F02] font-semibold text-left mb-2">● About Us</p>
                <h1 className="font-bold text-[#005F02] text-4xl mb-12">Get to Know Our Barangay</h1>
            </div>

            {/* Content Section - Left Image & Right Text */}
            <div className="flex items-center gap-12">

                {/* Left Section - Image */}
                <div className="w-1/2 shrink-0 mx-auto">
                    <img
                        src={aboutUsImage}
                        alt="Barangay community members collaborating"
                        className="w-full h-auto rounded-lg object-cover"
                        loading="lazy"
                    />
                </div>

                {/* Right Section - Text & Bullet Points */}
                <div className="w-1/3 mx-auto">
                    <p className="text-[18px] font-semibold leading-relaxed mb-6">
                        Our Resident and House Registry System is a digital system created to record and manage resident and household information in the community. It helps store important data in an organized and easy-to-access way for barangay use.
                    </p>

                    <p className="text-[18px] font-semibold leading-relaxed mb-8">
                        This system focuses on accuracy, proper record-keeping, and ease of use. It supports barangay staff in managing resident and house records more efficiently while keeping information updated and reliable. Through a simple and structured design, the system helps improve daily operations and decision-making.
                    </p>

                    {/* Bullet Points */}
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <img src={CheckList} alt="" className="w-6 h-6 mt-1" aria-hidden="true" />
                            <p className="text-base font-bold">Organized resident and household records</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <img src={CheckList} alt="" className="w-6 h-6 mt-1" aria-hidden="true" />
                            <p className="text-base font-bold">Easy and secure data management</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <img src={CheckList} alt="" className="w-6 h-6 mt-1" aria-hidden="true" />
                            <p className="text-base font-bold">Simple and user-friendly system</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <img src={CheckList} alt="" className="w-6 h-6 mt-1" aria-hidden="true" />
                            <p className="text-base font-bold">Supports efficient barangay operations</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}