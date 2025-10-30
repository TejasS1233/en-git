import {
  Logo01,
  Logo02,
  Logo03,
  Logo04,
  Logo05,
  Logo06,
  Logo07,
  Logo08,
} from "@/components/blocks/LogoScroll/logos";
import Marquee from "@/components/ui/marquee";

const LogoScroll = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="overflow-hidden">
        <p className="text-center text-xl font-medium">
          More than 2.2 million companies worldwide already trust us
        </p>

        <div className="mt-20 flex items-center justify-center gap-x-14 gap-y-10 max-w-5xl">
          <Marquee pauseOnHover className="[--duration:20s] [&_svg]:mr-10">
            <Logo01 />
            <Logo02 />
            <Logo03 />
            <Logo04 />
            <Logo05 />
            <Logo06 />
            <Logo07 />
            <Logo08 />
          </Marquee>
        </div>
      </div>
    </div>
  );
};

export default LogoScroll;
