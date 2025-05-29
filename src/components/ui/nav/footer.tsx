
import { FaXTwitter } from 'react-icons/fa6';

export const Footer = () => {
  return (
    <footer className="relative bg-purple-900 pb-6 pt-8 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap text-left lg:text-left">
          <div className="w-full px-4 lg:w-6/12">
            <h4 className="text-3xl font-semibold">Lets keep in touch!</h4>
            <h5 className="mb-2 mt-0 text-lg">
              Find us on any of these platforms, we will respond as quick as we
              can!
            </h5>
            <div className="my-6 lg:mb-0">

            </div>
          </div>
          <div className="w-full px-4 lg:w-6/12">
            <div className=" mb-6 flex flex-wrap">
              <div className="ml-auto w-full px-4 lg:w-4/12">
                <span className=" mb-2 block text-sm font-semibold uppercase">
                  Useful Links
                </span>
                <ul className="">
                  <li>
                    <a
                      className=" block pb-2 text-sm font-semibold hover:text-blue-600"
                      href="https://www.creative-tim.com/presentation?ref=njs-profile"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      className="block pb-2 text-sm font-semibold hover:text-blue-600"
                      href="https://blog.creative-tim.com?ref=njs-profile"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      className=" block pb-2 text-sm font-semibold hover:text-blue-600"
                      href="https://www.github.com/creativetimofficial?ref=njs-profile"
                    >
                      Github
                    </a>
                  </li>
                  <li>
                    <a
                      className=" block pb-2 text-sm font-semibold hover:text-blue-600"
                      href="https://www.creative-tim.com/bootstrap-themes/free?ref=njs-profile"
                    >
                      Free Products
                    </a>
                  </li>
                </ul>
              </div>
              <div className="w-full px-4 lg:w-4/12">
                <span className="mb-2 block  text-sm font-semibold uppercase">
                  Other Resources
                </span>
                <ul className="">
                  <li>
                    <a
                      className=" block pb-2 text-sm font-semibold hover:text-blue-600"
                      href="https://github.com/creativetimofficial/notus-js/blob/main/LICENSE.md?ref=njs-profile"
                    >
                      MIT License
                    </a>
                  </li>
                  <li>
                    <a
                      className=" block pb-2 text-sm font-semibold hover:text-blue-600"
                      href="https://creative-tim.com/terms?ref=njs-profile"
                    >
                      Terms &amp; Conditions
                    </a>
                  </li>
                  <li>
                    <a
                      className="block pb-2 text-sm font-semibold hover:text-blue-600"
                      href="https://creative-tim.com/privacy?ref=njs-profile"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      className=" block pb-2 text-sm font-semibold hover:text-blue-600"
                      href="https://creative-tim.com/contact-us?ref=njs-profile"
                    >
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <hr className="my-6 " />
        <div className="flex flex-wrap items-center justify-center md:justify-between">
          <div className="mx-auto w-full px-4 text-center md:w-4/12">
            <div className="py-1 text-sm font-semibold">
              Copyright © <span id="get-current-year">2024</span> Trackspace
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
