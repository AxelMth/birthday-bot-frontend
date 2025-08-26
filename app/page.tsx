"use client";

import { useEffect, useMemo, useState } from "react";

import { Header } from "@/components/header";
import { Container } from "@/components/container";
import { getNextDayDate, getNextMonthDate, getNextWeekDate, getTodayDate } from "@/lib/date";
import { birthdaysClientService } from "@/lib/clients/birthdays.client.service";
import { Button } from "@/components/ui/button";

type Person = {
  name: string;
  birthDate: Date;
};

type Range = "today" | "nextDay" | "nextWeek" | "nextMonth";

export default function HomePage() {
  const [nextPeople, setNextPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  const peopleBirthdayByRange = useMemo(() => {
    return getPeopleByBirthdayRange(nextPeople);
  }, [nextPeople]);

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(() => {
    // Initialize with today and nextDay expanded
    const initial: Record<string, boolean> = {};
    Object.keys(peopleBirthdayByRange).forEach((range) => {
      initial[range] = range === "today" || range === "nextDay";
    });
    return initial;
  });

  useEffect(() => {
    const fetchNextBirthdays = async () => {
      const nextMonth = getNextMonthDate();
      const { data, error } = await birthdaysClientService.getNextBirthdays(
        nextMonth.toISOString().split("T")[0],
      );
      if (error) {
        setConnectionError(true);
        return;
      }
      if (data) {
        setNextPeople(
          data.people.map((person) => ({
            name: person.name ?? "",
            birthDate: new Date(person.birthDate ?? ""),
          })) ?? [],
        );
      }
    };
    setLoading(true);
    setConnectionError(false);
    fetchNextBirthdays();
    setLoading(false);
  }, []);

  const getRangeName = (range: string) => {
    if (range === "today") {
      return "Aujourd'hui";
    } else if (range === "nextDay") {
      return "Demain";
    }
    if (range === "nextWeek") {
      return "La semaine prochaine";
    }
    if (range === "nextMonth") {
      return "Le mois prochain";
    }
  };

  const rangeOrder: Range[] = ["today", "nextDay", "nextWeek", "nextMonth"];

  return (
    <Container>
      <Header title="Accueil" description="Bienvenue sur le tableau de bord" />

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center flex-1">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : connectionError ? (
          <div className="flex justify-center items-center flex-1">
            <div className="text-center space-y-4">
              <p>Une erreur est survenue lors de la récupération des données.</p>
              <Button onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          </div>
        ) : (
          rangeOrder.map((range) => {
            const people =
              peopleBirthdayByRange[range as keyof typeof peopleBirthdayByRange];
            const isExpanded = expandedSections[range] || false;

          const toggleExpanded = () => {
            setExpandedSections((prev) => ({
              ...prev,
              [range]: !prev[range],
            }));
          };

          return (
            <div key={range} className="bg-white rounded-lg shadow-md border">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                onClick={toggleExpanded}
              >
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-bold">{getRangeName(range)}</h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {people.length} personne{people.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="text-gray-400">
                  {isExpanded ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100">
                  {people.length > 0 ? (
                    <div className="p-4 space-y-2">
                      {people.map((person) => (
                        <div
                          key={person.name}
                          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                              {person.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{person.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {person.birthDate.toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Aucun anniversaire dans cette période
                    </div>
                  )}
                </div>
              )}
            </div>
            );
          })
        )}
      </div>
    </Container>
  );
}

function getPeopleByBirthdayRange(people: Person[]): Record<Range, Person[]> {
  const today = getTodayDate();
  const nextDay = getNextDayDate();
  const nextWeek = getNextWeekDate();

  const peopleByRange = people.reduce((acc, person) => {
    const birthDateWithCurrentYear = new Date(
      new Date().getFullYear(),
      person.birthDate.getMonth(),
      person.birthDate.getDate(),
    );
    if (birthDateWithCurrentYear === today) {
      acc.today.push(person);
    } else if (birthDateWithCurrentYear === nextDay) {
      acc.nextDay.push(person);
    } else if (birthDateWithCurrentYear < nextWeek) {
      acc.nextWeek.push(person);
    } else {
      acc.nextMonth.push(person);
    }
    return acc;
  }, { today: [], nextDay: [], nextWeek: [], nextMonth: [] } as Record<Range, Person[]>);

  return Object.entries(peopleByRange).reduce((acc, [range, people]) => {
    acc[range as Range] = people.sort((a, b) => a.birthDate.getTime() - b.birthDate.getTime());
    return acc;
  }, {} as Record<Range, Person[]>);
}