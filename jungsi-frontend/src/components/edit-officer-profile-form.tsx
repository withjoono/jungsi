/**
 * 평가자 프로필 수정 폼
 *
 * Note: Spring 백엔드가 비활성화되어 프로필 저장 기능이 일시 중단되었습니다.
 * NestJS 백엔드에 해당 기능이 마이그레이션되면 이 컴포넌트를 업데이트하세요.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "./custom/button";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { editOfficerProfileFormSchema } from "@/lib/validations/edit-officer-profile";
import { useOfficerProfile } from "@/stores/server/features/susi/evaluation/queries";
import { ChangeEvent, useEffect, useRef, useState } from "react";
// Spring API는 더 이상 사용하지 않음 (2024-12 NestJS로 완전 마이그레이션)
// import { SPRING_API } from "@/stores/server/features/spring/apis";

interface Props {
  className?: string;
}

export function EditOfficerProfileForm({ className }: Props) {
  const { data: officerProfile, refetch: _refetchOfficerProfile } =
    useOfficerProfile();
  const _navigate = useNavigate();
  const { image, setImage, imageInput, handleImageClick, handleImageChange } =
    useImageUpload();

  const form = useForm<z.infer<typeof editOfficerProfileFormSchema>>({
    resolver: zodResolver(editOfficerProfileFormSchema),
    defaultValues: {
      name: "",
      university: "",
      education: "",
    },
  });

  useEffect(() => {
    if (officerProfile) {
      setImage(officerProfile.officer_profile_image);
      form.reset({
        name: officerProfile.officer_name || "",
        university: officerProfile.university || "",
        education: officerProfile.education || "",
      });
    }
  }, [officerProfile, form, setImage]);

  /**
   * @deprecated Spring 백엔드가 비활성화되어 프로필 저장 기능을 사용할 수 없습니다.
   * NestJS 백엔드에 해당 기능이 마이그레이션되면 이 함수를 업데이트하세요.
   */
  const onSubmit = async (
    _values: z.infer<typeof editOfficerProfileFormSchema>,
  ) => {
    // Spring 백엔드가 비활성화되어 프로필 저장 기능 비활성화
    toast.error("프로필 저장 기능이 현재 점검 중입니다. 잠시 후 다시 시도해주세요.");
    console.warn(
      "[EditOfficerProfileForm] Spring 백엔드가 비활성화되어 프로필 저장을 사용할 수 없습니다."
    );

    // 기존 Spring API 호출 코드 (비활성화됨)
    // try {
    //   const file = imageInput.current?.files?.[0] || null;
    //   const result = await SPRING_API.updateOfficerProfileAPI(
    //     values.name,
    //     values.university,
    //     values.education,
    //     file,
    //   );
    //   if (result.status) {
    //     toast.success("성공적으로 프로필을 업데이트했습니다.");
    //     await refetchOfficerProfile();
    //     navigate({ to: "/officer/profile" });
    //   } else {
    //     toast.error("저장에 실패했습니다");
    //   }
    // } catch (e) {
    //   console.error(e);
    //   toast.error("저장에 실패했습니다");
    // }
  };

  return (
    <Form {...form}>
      <div className={cn("space-y-2", className)}>
        <img
          src={image}
          className="size-40 cursor-pointer rounded-full"
          onClick={handleImageClick}
          alt="Profile"
        />
        <input
          type="file"
          onChange={handleImageChange}
          ref={imageInput}
          className="hidden"
          accept="image/*"
        />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl>
                  <Input placeholder="이름" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="university"
            render={({ field }) => (
              <FormItem>
                <FormLabel>출신대학</FormLabel>
                <FormControl>
                  <Input placeholder="출신대학" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="education"
            render={({ field }) => (
              <FormItem>
                <FormLabel>학과/학력</FormLabel>
                <FormControl>
                  <Input placeholder="학과/학력" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            저장
          </Button>
        </form>
      </div>
    </Form>
  );
}

const useImageUpload = () => {
  const [image, setImage] = useState<string>("");
  const imageInput = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    imageInput.current?.click();
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await convertBase64(file);
      setImage(base64 as string);
    }
  };

  const convertBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result as string);
      fileReader.onerror = (error) => reject(error);
    });
  };

  return { image, setImage, imageInput, handleImageClick, handleImageChange };
};
