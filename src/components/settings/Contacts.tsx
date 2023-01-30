import { ICON_SIZE } from "@src/contants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "../common/PageWrapper";

export const Contacts = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-10">
        <FiChevronLeft
          className="cursor-pointer"
          size={ICON_SIZE}
          onClick={() => navigate(-1)}
        />
        <p className="font-medium text-2xl">Contacts</p>
      </div>
    </PageWrapper>
  );
};
