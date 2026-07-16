"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Ruler, User } from "lucide-react"

interface SizeCalculatorProps {
  isOpen: boolean
  onClose: () => void
}

export function SizeCalculator({ isOpen, onClose }: SizeCalculatorProps) {
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [recommendedSize, setRecommendedSize] = useState("")
  const [showResult, setShowResult] = useState(false)

  const calculateSize = () => {
    const heightNum = Number.parseFloat(height)
    const weightNum = Number.parseFloat(weight)

    if (!heightNum || !weightNum || heightNum < 140 || heightNum > 220 || weightNum < 40 || weightNum > 150) {
      return
    }

    // Calculate BMI
    const bmi = weightNum / Math.pow(heightNum / 100, 2)

    // Size calculation based on height and BMI
    let size = ""

    if (heightNum < 165) {
      // Shorter heights
      if (bmi < 20) size = "S"
      else if (bmi < 25) size = "M"
      else if (bmi < 30) size = "L"
      else size = "XL"
    } else if (heightNum < 175) {
      // Medium heights
      if (bmi < 18.5) size = "S"
      else if (bmi < 23) size = "M"
      else if (bmi < 28) size = "L"
      else size = "XL"
    } else if (heightNum < 185) {
      // Taller heights
      if (bmi < 18) size = "M"
      else if (bmi < 22) size = "L"
      else if (bmi < 27) size = "XL"
      else size = "XXL"
    } else {
      // Very tall heights
      if (bmi < 20) size = "L"
      else if (bmi < 25) size = "XL"
      else size = "XXL"
    }

    setRecommendedSize(size)
    setShowResult(true)
  }

  const resetCalculator = () => {
    setHeight("")
    setWeight("")
    setRecommendedSize("")
    setShowResult(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-black shadow-2xl border-2 border-black dark:border-white">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <span className="text-white dark:text-black font-bold">١١١</span>
              </div>
              <CardTitle className="text-xl font-bold">Find Your Perfect T-Shirt Size</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {!showResult ? (
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Enter your measurements to get your recommended size
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="h-12 text-lg border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white"
                    min="140"
                    max="220"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-medium flex items-center">
                    <Ruler className="h-4 w-4 mr-2" />
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="h-12 text-lg border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white"
                    min="40"
                    max="150"
                  />
                </div>
              </div>

              <Button
                onClick={calculateSize}
                disabled={!height || !weight}
                className="w-full h-12 bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 text-lg font-bold"
              >
                Get My Size
              </Button>

              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                This is a general guide. For best fit, we recommend trying on the garment.
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white dark:text-black font-bold text-2xl">{recommendedSize}</span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-2">Your Recommended Size</h3>
                  <p className="text-4xl font-bold text-black dark:text-white">{recommendedSize}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Based on your height ({height}cm) and weight ({weight}kg)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={resetCalculator}
                  variant="outline"
                  className="w-full h-12 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black bg-transparent"
                >
                  Calculate Again
                </Button>

                <Button
                  onClick={onClose}
                  className="w-full h-12 bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  Close
                </Button>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Remember: This is a general guide. Individual fit preferences may vary.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
