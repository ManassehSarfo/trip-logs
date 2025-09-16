import LogSheet from "../components/log/LogSheet";
import PageSwitcher from "../components/ui/PageSwitcher";

export default function Logs() {

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center gap-4 mb-6 w-full sm:w-1/3 justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Daily Log Sheets</h1>
        <PageSwitcher />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LogSheet
            day={1}
            entries={[
                { startHour: 0, endHour: 6, status: "off" },
                { startHour: 6, endHour: 12, status: "driving" },
                { startHour: 12, endHour: 14, status: "onduty" },
                { startHour: 14, endHour: 24, status: "sleeper" },
            ]}
            />
      </div>
    </div>
  );
}
