<?php

use Livewire\Component;

new class extends Component
{
    //
};
?>

<div class="bg-slate-50 min-h-screen font-poppins pb-20">
    <div class="bg-[#064e3b] pt-20 pb-32 text-center relative overflow-hidden">
        <div class="absolute inset-0 opacity-10">
            <i class="fa-solid fa-leaf text-9xl absolute -top-10 -left-10 rotate-45"></i>
            <i class="fa-solid fa-droplet text-9xl absolute -bottom-10 -right-10 -rotate-12"></i>
        </div>

        <div class="relative z-10 container mx-auto px-4">
            <h1 class="text-4xl md:text-6xl font-black text-white mb-4">Get in Touch</h1>
            <p class="text-emerald-100 max-w-2xl mx-auto text-lg">
                Have questions about our organic Sundarban products? We're here to help you experience the purity of nature.
            </p>
        </div>
    </div>

    <div class="container mx-auto px-4 -mt-16 relative z-20">
        <div class="flex flex-col lg:flex-row gap-8">

            <div class="w-full lg:w-1/3 space-y-6">
                <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div class="space-y-8">
                        <div class="flex gap-4">
                            <div class="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#064e3b] shrink-0">
                                <i class="fa-solid fa-location-dot text-xl"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-800">Our Location</h4>
                                <p class="text-slate-500 text-sm mt-1">Khulna, Bangladesh<br>Gateway to the Sundarbans</p>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                                <i class="fa-solid fa-phone text-xl"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-800">Phone & WhatsApp</h4>
                                <p class="text-slate-500 text-sm mt-1">+880 1XXX-XXXXXX</p>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                <i class="fa-solid fa-envelope text-xl"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-800">Email Address</h4>
                                <p class="text-slate-500 text-sm mt-1">hello@mangrovecollection.com</p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-10 pt-10 border-t border-slate-50">
                        <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Follow Our Journey</h4>
                        <div class="flex justify-center gap-4">
                            <a href="#" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-[#064e3b] hover:text-white transition-all"><i class="fa-brands fa-facebook-f"></i></a>
                            <a href="#" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-[#064e3b] hover:text-white transition-all"><i class="fa-brands fa-instagram"></i></a>
                            <a href="#" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-[#064e3b] hover:text-white transition-all"><i class="fa-brands fa-whatsapp"></i></a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="w-full lg:w-2/3">
                <div class="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                    <form action="#" class="space-y-8 p-1 bg-white">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="relative group">
                                <label class="absolute -top-3 left-4 bg-white px-2 text-xs font-black text-[#064e3b] uppercase tracking-widest z-10 transition-all group-focus-within:text-emerald-500">
                                    Full Name
                                </label>
                                <div class="relative flex items-center">
                                    <i class="fa-solid fa-user absolute left-5 text-slate-300 group-focus-within:text-[#064e3b] transition-colors"></i>
                                    <input type="text" placeholder="e.g. Seemol Chakroborti"
                                        class="w-full pl-12 pr-5 py-5 bg-white border-2 border-slate-100 rounded-3xl text-sm focus:border-[#064e3b] focus:ring-0 transition-all placeholder:text-slate-300 font-medium text-slate-700 shadow-sm">
                                </div>
                            </div>

                            <div class="relative group">
                                <label class="absolute -top-3 left-4 bg-white px-2 text-xs font-black text-[#064e3b] uppercase tracking-widest z-10 transition-all group-focus-within:text-emerald-500">
                                    Email Address
                                </label>
                                <div class="relative flex items-center">
                                    <i class="fa-solid fa-envelope absolute left-5 text-slate-300 group-focus-within:text-[#064e3b] transition-colors"></i>
                                    <input type="email" placeholder="example@gmail.com"
                                        class="w-full pl-12 pr-5 py-5 bg-white border-2 border-slate-100 rounded-3xl text-sm focus:border-[#064e3b] focus:ring-0 transition-all placeholder:text-slate-300 font-medium text-slate-700 shadow-sm">
                                </div>
                            </div>
                        </div>

                        <div class="relative group">
                            <label class="absolute -top-3 left-4 bg-white px-2 text-xs font-black text-[#064e3b] uppercase tracking-widest z-10">
                                How can we help?
                            </label>
                            <div class="relative flex items-center">
                                <i class="fa-solid fa-circle-info absolute left-5 text-slate-300 group-focus-within:text-[#064e3b] transition-colors"></i>
                                <select class="w-full pl-12 pr-10 py-5 bg-white border-2 border-slate-100 rounded-3xl text-sm focus:border-[#064e3b] focus:ring-0 transition-all appearance-none font-medium text-slate-700 cursor-pointer shadow-sm">
                                    <option>General Inquiry</option>
                                    <option>Bulk/Wholesale Orders</option>
                                    <option>Shipping & Returns</option>
                                    <option>Partner with Us</option>
                                </select>
                                <i class="fa-solid fa-chevron-down absolute right-5 text-slate-300 pointer-events-none text-xs"></i>
                            </div>
                        </div>

                        <div class="relative group">
                            <label class="absolute -top-3 left-4 bg-white px-2 text-xs font-black text-[#064e3b] uppercase tracking-widest z-10">
                                Your Message
                            </label>
                            <textarea rows="5" placeholder="Write your message here..."
                                class="w-full px-6 py-5 bg-white border-2 border-slate-100 rounded-3xl text-sm focus:border-[#064e3b] focus:ring-0 transition-all resize-none placeholder:text-slate-300 font-medium text-slate-700 shadow-sm"></textarea>
                        </div>

                        <div class="pt-2">
                            <button type="submit"
                                class="w-full group relative overflow-hidden bg-[#064e3b] text-white font-black uppercase tracking-[0.2em] py-6 rounded-3xl shadow-2xl shadow-emerald-900/20 hover:shadow-[#064e3b]/40 transition-all active:scale-[0.98]">
                                <span class="absolute inset-0 w-0 bg-slate-900 transition-all duration-500 ease-out group-hover:w-full opacity-20"></span>

                                <span class="relative flex items-center justify-center gap-3">
                                    Send Message
                                    <div class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                                        <i class="fa-solid fa-paper-plane text-xs"></i>
                                    </div>
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </div>
    </div>
</div>