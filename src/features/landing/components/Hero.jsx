import Carousel from './Carousel';
import { Background } from '../../../shared';
import FBLogo from '../../../assets/icons/facebook-logo.svg';
import QCLogo from '../../../assets/icons/qc-logo.jpg';

export default function Hero() {
    return (
        <Background>
                
                {/* Top Section - Text */}
                <div className="flex items-center justify-between lg:mt-23 md:mt-30">
                    
                    {/* Left Section */}
                    <div className="flex-1">
                        <p className="text-white text-lg font-base mb-2">For Local Community Administration</p>
                        <h1 className="text-white text-5xl md:text-6xl font-black leading-tight uppercase">
                            A CLEAR VIEW OF EVERY RESIDENT AND HOUSE    
                        </h1>
                    </div>

                    {/* Right Section */}
                    <div className="flex-1">
                        <p className="text-white text-lg leading-relaxed mb-6">
                            The resident and housing registry system organizes community records into a single digital platform. It enables efficient data management, consistent record-keeping, and better support for local administrative decision-making.
                        </p>
                        <div className="flex items-center gap-6">
                           <a href="https://quezoncity.gov.ph/brgy-directory/san-bartolome/"  target="_blank"> <button  className="px-8 py-3 border-2 border-white text-white font-semibold hover:bg-white hover:text-emerald-900 rounded-lg transition-all duration-300">
                                VISIT US
                            </button> </a>
                            <div className="flex -space-x-2">
                               <a href="https://quezoncity.gov.ph/" target="_blank"> 
                               <img src={QCLogo} alt="Quezon City Logo" 
                               className="relative z-10 w-8 h-8 rounded-full border-2 border-white object-cover hover:bg-gray-400 hover:scale-110 transition-all duration-300" /> </a>

                               <a href="https://www.facebook.com/brgysanbartolome2014/" target="_blank"> 
                               <img src={FBLogo} 
                               alt="Facebook Logo" 
                               className="relative z-0 w-8 h-8 rounded-full border-2 border-white object-cover hover:bg-gray-400 hover:scale-110 transition-all duration-300" /> </a>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Bottom Section - Carousel */}
            <Carousel />
        </Background>
    );
}