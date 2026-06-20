import { useI18n, languageOptions } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className={className}>
      <Select value={language} onValueChange={(value) => setLanguage(value as typeof language)}>
        <SelectTrigger className="w-[150px] rounded-full">
          <SelectValue aria-label={t("app.language")} />
        </SelectTrigger>
        <SelectContent>
          {languageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {t(option.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
