import { NavBar } from '../../../layout'
import { Footer } from '../../../layout'
import { Background } from '../../../shared/components'
import Location from '../../../assets/icons/location.svg'
import PhoneNo from '../../../assets/icons/phone-no.svg'
import Phone from '../../../assets/icons/phone.svg'
import EmailRounded from '../../../assets/icons/email-rounded.svg'
import OfficeHour from '../../../assets/icons/office-hour.svg'

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Backend if ever
  }

  return (
    <>
      <NavBar />
      {/* Header Banner */}
      <Background>
        <div className="container mx-auto flex flex-col items-center justify-center px-4">
          <h1 className="text-white text-4xl md:text-6xl lg:text-[100px] font-bold text-center">
          <div className='absolute top-40 bottom-0 left-25 right-25 border-t mx-auto border-white opacity-80' />
            Contact Us
          </h1>
        </div>
      </Background>

      {/* Main Content */}
      <section className="w-full  bg-gray-50 py-12 md:py-100 px-4 md:px-8">
        <div className="absolute top-150 left-0 right-0 py-4 md:py-16 px-4 md:px-8 lg:px-12 container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] gap-8 lg:gap-10 xl:gap-14 items-start">
            {/* Left Column – Contact info & help */}
            <div className="space-y-6 mb-6 lg:mb-0">
              {/* Contact Information Card */}
              <article className="bg-white font-semibold rounded-xl shadow-md p-5 md:p-6 border border-gray-200">
                <h3 className="text-left text-lg md:text-xl font-bold text-[#005F02] mb-4">
                  Contact Information
                </h3>
                <hr className="mx-5 md:-mx-6 border-t border-gray-300 my-3" />
                <p className="text-base md:text-lg leading-relaxed mb-7">
                  <span className="font-semibold">
                    Barangay Resident & House Registry
                  </span>
                </p>
                <div className="space-y-8 mb-5 text-base md:text-lg leading-relaxed">
                  <div className="flex items-start gap-3">
                    <img
                      src={Location}
                      alt="Location"
                      className="w-6 h-6 mt-0.5 shrink-0"
                    />
                    <p>
                      <span className="font-semibold text-[#005F02]">
                        Office Address:
                      </span>{' '}
                      123 Barangay San Bartolome, Quezon City
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <img
                      src={PhoneNo}
                      alt="Phone number"
                      className="w-6 h-6 mt-0.5 shrink-0"
                    />
                    <p>
                      <span className="font-semibold text-[#005F02]">
                        Phone Number:
                      </span>{' '}
                      (0912) 345-6789
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <img
                      src={EmailRounded}
                      alt="Email"
                      className="w-6 h-6 mt-0.5 shrink-0"
                    />
                    <p>
                      <span className="font-semibold text-[#005F02]">Email:</span>{' '}
                      info@brgy123.ph
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <img
                      src={OfficeHour}
                      alt="Office hours"
                      className="w-6 h-6 mt-0.5 shrink-0"
                    />
                    <p>
                      <span className="font-semibold text-[#005F02]">
                        Office Hours:
                      </span>{' '}
                      Monday – Friday, 8:00 AM – 5:00 PM
                    </p>
                  </div>
                </div>
              </article>

              {/* Need Help Card */}
              <article className="bg-white rounded-xl font-semibold shadow-md p-5 md:p-6 border border-gray-200">
                <h3 className="text-left text-lg md:text-xl  text-[#005F02] mb-4">
                  Need Help?
                </h3>
                <hr className="mx-5 md:-mx-6 border-t border-gray-300 my-3" />
                <div className="space-y-3 text-base md:text-lg leading-relaxed mb-2">
                  <div className="flex items-start gap-3">
                    <p>
                      How to use the system? Visit our{' '}
                      <a
                        href="/faq"
                        className="text-[#07ACD2] underline underline-offset-2"
                      >
                        FAQ Page
                      </a>{' '}
                      for more information.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <img
                      src={Phone}
                      alt="Emergency contact"
                      className="w-6 h-6 mt-0.5 shrink-0"
                    />
                    <p>
                      For emergencies, contact:{' '}
                      <span className="font-semibold">(0911) 123-4567</span>
                    </p>
                  </div>
                </div>
              </article>
            </div>

            {/* Right Column – Contact form */}
            <div className=" rounded-xl shadow-md border-none lg:border-2 overflow-hidden bg-white">
              {/* Card Header */}
              <div className="bg-white *:px-5 mt-5">
                <h3 className="text-left text-2xl font-bold text-[#005F02] mb-4">
                  Contact Form
                </h3>
                <hr className='mx-5 md:-mx-6 border-t border-gray-300 my-3"'></hr>
              </div>

              {/* Card Body */}
              <form
                onSubmit={handleSubmit}
                className="p-5 md:p-6 space-y-4  bg-white"
              >
                {/* Full Name */}
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm md:text-base focus:outline-none"
                  placeholder="Full Name"
                  required
                />

                {/* Email Address */}
                <input
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm md:text-base focus:outline-none"
                  placeholder="Email Address"
                  required
                />

                {/* Contact Number */}
                <input
                  type="tel"
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm md:text-base focus:outline-none"
                  placeholder="Contact Number"
                />

                {/* Subject + Select Concern combo row */}
                <div className="w-full rounded-md border border-gray-300 flex overflow-hidden bg-white">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2.5 text-sm md:text-base border-r border-gray-300 focus:outline-none focus:ring-2"
                    placeholder="Subject"
                    required
                  />
                  <select
                    className="flex-1 px-3 py-2.5 text-sm md:text-base bg-white focus:outline-none"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Select Concern
                    </option>
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Issue</option>
                    <option value="feedback">Feedback / Suggestions</option>
                    <option value="records">Resident / Household Records</option>
                  </select>
                </div>

                {/* Message */}
                <div className="rounded-md border border-gray-300 overflow-hidden">
                  <div className="px-3 pt-2 mb-2 text-sm text-gray-700">Message</div>
                  <hr className='border-gray-300'></hr>
                  <textarea
                    rows="5"
                    className="w-full px-3 pb-2 pt-1 text-sm md:text-base resize-none focus:outline-none"
                    placeholder="Enter your message here..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-md bg-[#005F02] text-white font-semibold py-2.5 md:py-3 text-sm md:text-base hover:bg-[#004701] transition-colors"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
          

          {/* Bottom Privacy Notice */}
          <div className="mt-10 border border-gray-200 bg-white rounded-xl shadow-sm px-5 md:px-6 py-4">
            <h3 className="text-lg md:text-xl font-bold text-[#005F02] mb-2">
              Privacy Notice
            </h3>
            <hr className="mx-5 md:-mx-6 border-t border-gray-300 my-3" />
            <p className="font-bold text-sm md:text-base leading-relaxed text-gray-800 mb-5">
              Your information will be kept confidential and used solely for
              official registry purposes.
            </p>
          </div>

          {/* Bottom Divider */}
          <div className='container mx-auto flex flex-col items-center justify-center px-4'>
          <div className='absolute bottom-0 left-12 right-12 border-b  transition-all border-[#005F02]' />
          </div>
        </div>
      </section>
      <footer>
        <Footer />
      </footer>
    </>
  )
}
