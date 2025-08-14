import DashboardPageWrapper from "@/components/wrappers/DashboardPageWrapper";
import { ODRequestForm } from "@/components/forms/ODRequestForm";

export default function NewRequest() {
  return (
    <DashboardPageWrapper>
      <ODRequestForm />
    </DashboardPageWrapper>
  );
}