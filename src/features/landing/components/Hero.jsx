import Carousel from './Carousel';
import { Background } from '../../../shared';

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
                            <button className="px-8 py-3 border-2 border-white text-white font-semibold hover:bg-white hover:text-emerald-900 rounded-lg transition-all duration-300">
                                VISIT US
                            </button>
                            <div className="flex gap-4">
                                <a href="#" className="text-white hover:opacity-70 transition-opacity">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 11-13 13M23 3l-10 10M9 3l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </a>
                                <a href="#" className="text-white hover:opacity-70 transition-opacity">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a2 2 0 012-2h3z"/></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Bottom Section - Carousel */}
            <Carousel />
        </Background>
    );
}